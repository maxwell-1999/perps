import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { useQuery } from '@tanstack/react-query'
import {
  Address,
  Hex,
  decodeFunctionResult,
  encodeFunctionData,
  encodePacked,
  getAbiItem,
  getAddress,
  getContractAddress,
  keccak256,
  pad,
  toHex,
  zeroAddress,
} from 'viem'
import { usePublicClient } from 'wagmi'

import {
  DSUAddresses,
  MarketFactoryAddresses,
  MultiInvoker2Addresses,
  VaultFactoryAddresses,
} from '@/constants/contracts'
import { SupportedAsset, addressToAsset2 } from '@/constants/markets'
import { SupportedChainId } from '@/constants/network'
import { MaxUint256 } from '@/constants/units'
import { PerennialVaultType, chainVaultsWithAddress } from '@/constants/vaults'
import { notEmpty, sum } from '@/utils/arrayUtils'
import { Big6Math } from '@/utils/big6Utils'
import { Big18Math } from '@/utils/big18Utils'
import { buildCommitmentsForOracles } from '@/utils/pythUtils'

import { VaultAbi } from '@abi/v2/Vault.abi'
import { VaultLens2Abi } from '@abi/v2/VaultLens2.abi'

import LensArtifact from '../../../lens/artifacts/contracts/Lens.sol/Lens.json'
import VaultLensArtifact from '../../../lens/artifacts/contracts/Lens.sol/VaultLens.json'
import { getVaultContract } from '../../utils/contractUtils'
import { MarketOracles, useMarketOracles2 } from '../markets2'
import { useAddress, useChainId, usePyth, useRPCProviderUrl } from '../network'

export type VaultSnapshots = NonNullable<Awaited<ReturnType<typeof useVaultSnapshots2>>['data']>
export type VaultSnapshot2 = ChainVaultSnapshot & {
  pre: ChainVaultSnapshot
  assets: SupportedAsset[]
}
export type VaultAccountSnapshot2 = ChainVaultAccountSnapshot & {
  pre: ChainVaultAccountSnapshot
}

export const useVaultSnapshots2 = () => {
  const chainId = useChainId()
  const vaults = chainVaultsWithAddress(chainId)
  const { data: marketOracles } = useMarketOracles2()
  const { address: address_ } = useAddress()
  const pyth = usePyth()
  const providerUrl = useRPCProviderUrl()
  const address = address_ ?? zeroAddress

  return useQuery({
    enabled: !!vaults && !!vaults.length && !!marketOracles,
    queryKey: ['vaultSnapshots2', chainId, address],
    queryFn: async () => {
      if (!vaults || !vaults.length || !marketOracles) return

      const snapshotData = await fetchVaultSnapshotsAfterSettle(chainId, address, marketOracles, providerUrl, pyth)

      const vaultSnapshots = snapshotData.vault.reduce((acc, vaultData) => {
        acc[vaultData.vaultType] = {
          ...vaultData,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pre: snapshotData.vaultPre.find((pre) => pre.vaultType === vaultData.vaultType)!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          assets: vaultData.registrations.map((r) => addressToAsset2(r.market)!),
        }
        return acc
      }, {} as Record<PerennialVaultType, VaultSnapshot2>)

      const userSnapshots = snapshotData.user.reduce((acc, vaultData) => {
        acc[vaultData.vaultType] = {
          ...vaultData,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pre: snapshotData.userPre.find((pre) => pre.vaultType === vaultData.vaultType)!,
        }
        return acc
      }, {} as Record<PerennialVaultType, VaultAccountSnapshot2>)

      return {
        user: address === zeroAddress ? undefined : userSnapshots,
        vault: vaultSnapshots,
        commitments: snapshotData.commitments,
        settles: snapshotData.settles,
        updates: snapshotData.updates,
      }
    },
  })
}

export type ChainVaultSnapshot = Awaited<ReturnType<typeof fetchVaultSnapshotsAfterSettle>>['vault'][number]
export type ChainVaultAccountSnapshot = Awaited<ReturnType<typeof fetchVaultSnapshotsAfterSettle>>['user'][number]
const fetchVaultSnapshotsAfterSettle = async (
  chainId: SupportedChainId,
  address: Address,
  marketOracles: MarketOracles,
  providerUrl: string,
  pyth: EvmPriceServiceConnection,
) => {
  const vaults = chainVaultsWithAddress(chainId)
  const vaultLensAddress = getContractAddress({ from: address, nonce: MaxUint256 - 1n })
  const lensAddress = getContractAddress({ from: address, nonce: MaxUint256 })

  // TODO: there is some duplicate code here with the markets lens logic, we can probably consolidate some of this
  const priceCommitments = await buildCommitmentsForOracles({
    chainId,
    marketOracles: Object.values(marketOracles),
    pyth,
  })

  const vaultAddresses = vaults.map(({ vaultAddress }) => vaultAddress)

  const ethCallPayload = {
    to: vaultLensAddress,
    from: address,
    data: encodeFunctionData({
      abi: VaultLens2Abi,
      functionName: 'snapshot',
      args: [priceCommitments, lensAddress, vaultAddresses, address, MultiInvoker2Addresses[chainId]],
    }),
  }

  // Override operator approval so the vaultLens can update the address
  // Operator storage mapping is at index 0
  const vaultFactoryStorage = keccak256(encodePacked(['bytes32', 'bytes32'], [pad(address), pad(toHex(0n))]))
  const vaultFactoryStorageIndex = keccak256(
    encodePacked(['bytes32', 'bytes32'], [pad(vaultLensAddress), vaultFactoryStorage]),
  )
  const alchemyRes = await fetch(providerUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_call', // use a manual eth_call here to use state overrides
      params: [
        ethCallPayload,
        'latest',
        {
          // state diff overrides
          [lensAddress]: {
            code: LensArtifact.deployedBytecode,
            balance: toHex(Big18Math.fromFloatString('1000')),
          },
          [vaultLensAddress]: {
            code: VaultLensArtifact.deployedBytecode,
            balance: toHex(Big18Math.fromFloatString('1000')),
          },
          [VaultFactoryAddresses[chainId]]: {
            stateDiff: { [vaultFactoryStorageIndex]: pad(toHex(true)) },
          },
          [MarketFactoryAddresses[chainId]]: {
            stateDiff: vaultAddresses.reduce((acc, vaultAddress) => {
              // Override operator approval so the lens can update the vault
              const marketFactoryStorage = keccak256(
                encodePacked(['bytes32', 'bytes32'], [pad(vaultAddress), toHex(1n, { size: 32 })]),
              )
              const marketFactoryStorageIndex = keccak256(
                encodePacked(['bytes32', 'bytes32'], [pad(lensAddress), marketFactoryStorage]),
              )
              acc[marketFactoryStorageIndex] = pad(toHex(true))
              return acc
            }, {} as Record<string, Hex>),
          },
          // Grant DSU to vault lens to allow for settlement
          [DSUAddresses[chainId]]: {
            stateDiff: {
              [keccak256(encodePacked(['bytes32', 'bytes32'], [pad(vaultLensAddress), pad(toHex(1n))]))]: pad(
                toHex(Big18Math.fromFloatString('100000')),
              ),
            },
          },
        },
      ],
    }),
  })
  const batchRes = (await alchemyRes.json()) as { result: Hex }
  const lensRes = decodeFunctionResult({ abi: VaultLens2Abi, functionName: 'snapshot', data: batchRes.result })

  return {
    commitments: lensRes.commitmentStatus,
    updates: lensRes.updateStatus,
    settles: lensRes.settleStatus,
    vault: lensRes.postUpdate.vaultSnapshots
      .map((s) => {
        const vaultType = vaults.find(({ vaultAddress }) => vaultAddress === getAddress(s.vault))
        if (!vaultType) return
        return {
          ...s,
          vaultType: vaultType.vault,
        }
      })
      .filter(notEmpty),
    vaultPre: lensRes.preUpdate.vaultSnapshots
      .map((s) => {
        const vaultType = vaults.find(({ vaultAddress }) => vaultAddress === getAddress(s.vault))
        if (!vaultType) return
        return {
          ...s,
          vaultType: vaultType.vault,
        }
      })
      .filter(notEmpty),
    user: lensRes.postUpdate.vaultAccountSnapshots
      .map((s) => {
        const vaultType = vaults.find(({ vaultAddress }) => vaultAddress === getAddress(s.vault))
        if (!vaultType) return
        return {
          ...s,
          vaultType: vaultType.vault,
        }
      })
      .filter(notEmpty),
    userPre: lensRes.preUpdate.vaultAccountSnapshots
      .map((s) => {
        const vaultType = vaults.find(({ vaultAddress }) => vaultAddress === getAddress(s.vault))
        if (!vaultType) return
        return {
          ...s,
          vaultType: vaultType.vault,
        }
      })
      .filter(notEmpty),
  }
}

export type VaultPositionHistory = NonNullable<
  Awaited<ReturnType<typeof useVaultPositionHistory>>['data']
>[PerennialVaultType]
export const useVaultPositionHistory = () => {
  const chainId = useChainId()
  const { address } = useAddress()
  const client = usePublicClient()

  return useQuery({
    queryKey: ['vaultPositionHistory', chainId, address],
    enabled: !!chainId && !!address,
    queryFn: async () => {
      if (!address) return
      const vaults = chainVaultsWithAddress(chainId)
      const getLogsArgs = { account: address }

      // TODO: migrate this to the graph when available
      const vaultPositionHistory = await Promise.all(
        vaults.map(async ({ vaultAddress, vault }) => {
          const vaultContract = getVaultContract(vaultAddress, chainId)
          const logs_ = await client.getLogs({
            address: vaultAddress,
            args: getLogsArgs,
            fromBlock: 0n,
            toBlock: 'latest',
            strict: true,
            event: getAbiItem({ abi: VaultAbi, name: 'Updated' }),
          })
          const logs = logs_.sort((a, b) => Big6Math.cmp(b.args.version, a.args.version))

          const deposits = logs.filter((l) => l.args.depositAssets > 0n)
          const redeems = logs.filter((l) => l.args.redeemShares > 0n)
          const claims = logs.filter((l) => l.args.claimAssets > 0n)

          let currentPositionStartBlock = (logs.at(-1)?.blockNumber || 0n) - 1n
          for (const claim of claims) {
            if (claim.blockNumber === null) continue
            const accountData = await vaultContract.read.accounts([address], { blockNumber: claim.blockNumber })
            if (accountData.shares === 0n) {
              // If less than 100 wei, consider it a new starting block
              currentPositionStartBlock = claim.blockNumber
              break
            }
          }

          const currentPositionDeposits = sum(
            deposits.filter((l) => (l.blockNumber ?? 0n) > currentPositionStartBlock).map((l) => l.args.depositAssets),
          )
          const currentPositionClaims = sum(
            claims.filter((l) => (l.blockNumber ?? 0n) > currentPositionStartBlock).map((l) => l.args.claimAssets),
          )

          return {
            vault,
            vaultAddress,
            logs,
            deposits,
            redeems,
            claims,
            currentPositionDeposits,
            currentPositionClaims,
          }
        }),
      )

      return vaultPositionHistory.reduce((acc, vaultData) => {
        acc[vaultData.vault] = vaultData
        return acc
      }, {} as Record<PerennialVaultType, (typeof vaultPositionHistory)[number]>)
    },
  })
}
