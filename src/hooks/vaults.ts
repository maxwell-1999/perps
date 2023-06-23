import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { Address, BlockNumber, Hex, getAbiItem, getAddress } from 'viem'
import { PublicClient, usePublicClient, useSendTransaction, useWalletClient } from 'wagmi'
import { GetContractResult, waitForTransaction } from 'wagmi/actions'

import { MultiInvokerAddresses } from '@/constants/contracts'
import { MaxUint256 } from '@/constants/markets'
import { SupportedChainId, SupportedChainIds } from '@/constants/network'
import { PerennialVaultType, VaultSymbol } from '@/constants/vaults'
import { notEmpty, sum as sumArray } from '@/utils/arrayUtils'
import { Big18Math } from '@/utils/big18Utils'
import { InvokerAction, buildInvokerAction } from '@/utils/multiinvoker'

import { BalancedVaultAbi } from '@abi/BalancedVault.abi'
import { LensProductSnapshotAbi, LensUserProductSnapshotAbi } from '@abi/Lens.abi'

import { getProductContract, getVaultAddressForType, getVaultForType } from '../utils/contractUtils'
import {
  useDSU,
  useLensProductSnapshotViem,
  useLensUserProductSnapshotViem,
  useMultiInvoker,
  useUSDC,
} from './contracts'
import { useRefreshKeysOnPriceUpdates } from './markets'
import { useAddress, useChainId } from './network'

export const useVaultSnapshots = (vaultTypes: PerennialVaultType[]) => {
  const chainId = useChainId()
  const lensProductSnapshot = useLensProductSnapshotViem()
  const lensUserProductSnapshot = useLensUserProductSnapshotViem()

  return useQuery({
    queryKey: ['vaultSnapshots', vaultTypes, chainId],
    enabled: !!chainId,
    queryFn: async () => {
      if (!vaultTypes.length) {
        return []
      }
      const snapshots = await Promise.all(
        vaultTypes.map((vaultType) => vaultFetcher(vaultType, chainId, lensProductSnapshot, lensUserProductSnapshot)),
      )

      return snapshots.filter(notEmpty)
    },
  })
}

export type VaultSnapshot = Exclude<Awaited<ReturnType<typeof vaultFetcher>>, undefined>
const vaultFetcher = async (
  vaultType: PerennialVaultType,
  chainId: SupportedChainId,
  lensProduct: GetContractResult<typeof LensProductSnapshotAbi>,
  lensUserProduct: GetContractResult<typeof LensUserProductSnapshotAbi>,
) => {
  const vaultContract = getVaultForType(vaultType, chainId)
  if (!vaultContract) return

  const vaultAddress = vaultContract.address

  const [name, symbol, long, short, targetLeverage, maxCollateral] = await Promise.all([
    vaultContract.read.name(),
    vaultContract.read.symbol(),
    vaultContract.read.long(),
    vaultContract.read.short(),
    vaultContract.read.targetLeverage(),
    vaultContract.read.maxCollateral(),
  ])

  const [longSnapshot, shortSnapshot, longUserSnapshot, shortUserSnapshot, canSync, totalSupply, totalAssets] =
    await Promise.all([
      lensProduct.read.snapshot([long]),
      lensProduct.read.snapshot([short]),
      lensUserProduct.read.snapshot([vaultAddress, long]),
      lensUserProduct.read.snapshot([vaultAddress, short]),
      trySync(vaultContract),
      vaultContract.read.totalSupply(),
      vaultContract.read.totalAssets(),
    ])

  return {
    address: vaultAddress,
    name,
    symbol: symbol as VaultSymbol,
    long: long.toLowerCase(),
    short: short.toLowerCase(),
    totalSupply,
    totalAssets,
    targetLeverage,
    maxCollateral,
    longSnapshot: longSnapshot,
    shortSnapshot: shortSnapshot,
    longUserSnapshot: longUserSnapshot,
    shortUserSnapshot: shortUserSnapshot,
    canSync,
  }
}

export const useVaultUserSnapshot = (vaultSymbol: VaultSymbol) => {
  const chainId = useChainId()
  const client = usePublicClient()
  const { address } = useAddress()
  const vaultType = [VaultSymbol.PVA, VaultSymbol.ePBV].includes(vaultSymbol)
    ? PerennialVaultType.alpha
    : PerennialVaultType.bravo
  const vaultContract = getVaultForType(vaultType, chainId)

  return useQuery({
    queryKey: ['vaultUserSnapshot', chainId, vaultSymbol, address],
    enabled: !!chainId && !!address && !!vaultSymbol && !!vaultContract,
    queryFn: async () => {
      if (!address || !chainId || !vaultContract) return
      return vaultUserFetcher(address, vaultContract, chainId, client)
    },
  })
}

export type VaultUserSnapshot = Awaited<ReturnType<typeof vaultUserFetcher>>
const vaultUserFetcher = async (
  address: Address,
  vaultContract: GetContractResult<typeof BalancedVaultAbi>,
  chainId: SupportedChainId,
  client: PublicClient,
) => {
  const vaultAddress = vaultContract.address
  const getLogsArgs = { account: address }
  const [long, short, _deposits, _claims, _redemptions] = await Promise.all([
    vaultContract.read.long(),
    vaultContract.read.short(),
    client.getLogs({
      address: vaultAddress,
      args: getLogsArgs,
      fromBlock: 0n,
      toBlock: 'latest',
      strict: true,
      event: getAbiItem({ abi: vaultContract.abi, name: 'Deposit' }),
    }),
    client.getLogs({
      address: vaultAddress,
      args: getLogsArgs,
      fromBlock: 0n,
      toBlock: 'latest',
      strict: true,
      event: getAbiItem({ abi: vaultContract.abi, name: 'Claim' }),
    }),
    client.getLogs({
      address: vaultAddress,
      args: getLogsArgs,
      fromBlock: 0n,
      toBlock: 'latest',
      strict: true,
      event: getAbiItem({ abi: vaultContract.abi, name: 'Redemption' }),
    }),
  ])

  const longProduct = getProductContract(long, chainId)
  const shortProduct = getProductContract(short, chainId)

  const [, , , balance, claimable] = await Promise.all([
    longProduct.read.settleAccount([vaultAddress]),
    shortProduct.read.settleAccount([vaultAddress]),
    trySync(vaultContract),
    vaultContract.read.balanceOf([address]),
    vaultContract.read.unclaimed([address]),
  ])

  const [, , , latestVersion, assets] = await Promise.all([
    longProduct.read.settleAccount([vaultAddress]),
    shortProduct.read.settleAccount([vaultAddress]),
    trySync(vaultContract),
    longProduct.read.latestVersion(),
    vaultContract.read.convertToAssets([balance]),
  ])

  const deposits = _deposits.sort((a, b) => Big18Math.subFixed(b.args.version, a.args.version).toUnsafeFloat())
  const claims = _claims.sort((a, b) => Big18Math.cmp(b.blockNumber ?? 0n, a.blockNumber ?? 0n))
  const redemptions = _redemptions.sort((a, b) => Big18Math.subFixed(b.args.version, a.args.version).toUnsafeFloat())

  let pendingRedemptionAmount = 0n
  if (redemptions.length && redemptions[0].args.version >= latestVersion) {
    pendingRedemptionAmount = redemptions[0].args.shares
  }

  let pendingDepositAmount = 0n
  if (deposits.length && deposits[0].args.version >= latestVersion) {
    pendingDepositAmount = deposits[0].args.assets
  }

  let currentPositionStartBlock = (deposits.at(-1)?.blockNumber || 0n) - 1n
  for (const claim of claims) {
    if (claim.blockNumber === null) continue
    const [, balance] = await Promise.all([
      trySync(vaultContract, { blockNumber: claim.blockNumber }),
      vaultContract.read.balanceOf([address], { blockNumber: claim.blockNumber }),
    ])
    if (balance < 100n) {
      // If less than 100 wei, consider it a new starting block
      currentPositionStartBlock = claim.blockNumber
      break
    }
  }

  return {
    balance,
    assets,
    claimable,
    totalDeposit: sumArray(_deposits.map((e) => e.args.assets)),
    totalClaim: sumArray(_claims.map((e) => e.args.assets)),
    currentPositionDeposits: sumArray(
      _deposits.filter((e) => e.blockNumber ?? 0n > currentPositionStartBlock).map((e) => e.args.assets),
    ),
    currentPositionClaims: sumArray(
      _claims.filter((e) => e.blockNumber ?? 0n > currentPositionStartBlock).map((e) => e.args.assets),
    ),
    // Sort redemptions as most recent first
    deposits,
    claims,
    redemptions,
    pendingRedemptionAmount,
    pendingDepositAmount,
  }
}

export const useRefreshVaultsOnPriceUpdates = () => {
  const keys = ['vaultSnapshots', 'vaultUserSnapshot']
  useRefreshKeysOnPriceUpdates(keys)
}

export type VaultTransactions = {
  onApproveUSDC: () => Promise<void>
  onApproveDSU: () => Promise<void>
  onApproveShares: () => Promise<void>
  onDeposit: (amount: bigint) => Promise<void>
  onRedeem: (amount: bigint, { assets, max }: { assets?: boolean; max?: boolean }) => Promise<void>
  onClaim: (unwrapAmount?: bigint) => Promise<void>
}
export const useVaultTransactions = (vaultSymbol: VaultSymbol): VaultTransactions => {
  const { address } = useAddress()
  const chainId = useChainId()
  const usdcContract = useUSDC()
  const dsuContract = useDSU()
  const multiInvoker = useMultiInvoker()
  const { data: walletClient } = useWalletClient()
  const vaultType = [VaultSymbol.PVA, VaultSymbol.ePBV].includes(vaultSymbol)
    ? PerennialVaultType.alpha
    : PerennialVaultType.bravo

  const queryClient = useQueryClient()
  const { sendTransactionAsync } = useSendTransaction()

  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          ['vaultSnapshots', 'vaultUserSnapshot', 'vaultAllowances', 'balances'].includes(queryKey.at(0) as string) &&
          queryKey.includes(chainId),
      }),
    [chainId, queryClient],
  )

  const onApproveUSDC = async () => {
    if (!address || !chainId || !SupportedChainIds.includes(chainId)) {
      return
    }
    const txData = await usdcContract.approve.populateTransaction(MultiInvokerAddresses[chainId], MaxUint256)
    const receipt = await sendTransactionAsync({
      chainId,
      to: getAddress(txData.to),
      data: txData.data as Hex,
      account: walletClient?.account,
    })
    await waitForTransaction({ hash: receipt.hash })
    await refresh()
  }

  const onApproveDSU = async () => {
    if (!address || !chainId || !SupportedChainIds.includes(chainId)) {
      return
    }

    const txData = await dsuContract.approve.populateTransaction(MultiInvokerAddresses[chainId], MaxUint256)
    const receipt = await sendTransactionAsync({
      chainId,
      to: getAddress(txData.to),
      data: txData.data as Hex,
      account: walletClient?.account,
    })
    await waitForTransaction({ hash: receipt.hash })
    await refresh()
  }

  const onApproveShares = async () => {
    if (!address || !chainId || !SupportedChainIds.includes(chainId) || !walletClient) return
    const vaultContract = getVaultForType(vaultType, chainId, walletClient)
    if (!vaultContract) return

    const receiptHash = await vaultContract.write.approve([MultiInvokerAddresses[chainId], MaxUint256])
    await waitForTransaction({ hash: receiptHash })
    await refresh()
  }

  const onDeposit = async (amount: bigint) => {
    const vaultAddress = getVaultAddressForType(vaultType, chainId)
    if (!address || !chainId || !SupportedChainIds.includes(chainId) || !vaultAddress) return

    const actions = [
      buildInvokerAction(InvokerAction.VAULT_WRAP_AND_DEPOSIT, {
        userAddress: address,
        vaultAddress,
        vaultAmount: amount,
      }),
    ]
    // Extra buffer to account to changes to underlying state
    const gasLimit = await multiInvoker.invoke.estimateGas(actions, { from: address })
    const txData = await multiInvoker.invoke.populateTransaction(actions, { gasLimit: bufferGasLimit(gasLimit) })
    const receipt = await sendTransactionAsync({
      chainId,
      to: getAddress(txData.to),
      data: txData.data as Hex,
      account: walletClient?.account,
    })
    await waitForTransaction({ hash: receipt.hash })
    await refresh()
  }

  const onRedeem = async (amount: bigint, { assets = true, max = false }) => {
    const vaultContract = getVaultForType(vaultType, chainId)
    if (!address || !chainId || !SupportedChainIds.includes(chainId) || !vaultContract) {
      return
    }
    const vaultAddress = vaultContract.address

    let vaultAmount = max ? await vaultContract.read.balanceOf([address]) : amount
    if (assets) {
      vaultAmount = await convertAssetsToShares({ vaultType, assets: amount, chainId })
    }

    const actions = [
      buildInvokerAction(InvokerAction.VAULT_REDEEM, {
        userAddress: address,
        vaultAddress,
        vaultAmount,
      }),
    ]
    // Extra buffer to account to changes to underlying state
    const gasLimit = await multiInvoker.invoke.estimateGas(actions, { from: address })
    const txData = await multiInvoker.invoke.populateTransaction(actions, { gasLimit: bufferGasLimit(gasLimit) })
    const receipt = await sendTransactionAsync({
      chainId,
      to: getAddress(txData.to),
      data: txData.data as Hex,
      account: walletClient?.account,
    })
    await waitForTransaction({ hash: receipt.hash })
    await refresh()
  }

  const onClaim = async (unwrapAmount?: bigint) => {
    const vaultContract = getVaultForType(vaultType, chainId)
    if (!address || !chainId || !SupportedChainIds.includes(chainId) || !vaultContract) {
      return
    }
    const vaultAddress = vaultContract.address

    const actions = [
      buildInvokerAction(InvokerAction.VAULT_CLAIM, {
        userAddress: address,
        vaultAddress: vaultAddress,
      }),
    ]
    if (unwrapAmount) {
      actions.push(
        buildInvokerAction(InvokerAction.UNWRAP, {
          userAddress: address,
          amount: unwrapAmount,
        }),
      )
    }

    // Extra buffer to account to changes to underlying state
    const gasLimit = await multiInvoker.invoke.estimateGas(actions, { from: address })
    const txData = await multiInvoker.invoke.populateTransaction(actions, { gasLimit: bufferGasLimit(gasLimit) })
    const receipt = await sendTransactionAsync({
      chainId,
      to: getAddress(txData.to),
      data: txData.data as Hex,
      account: walletClient?.account,
    })
    await waitForTransaction({ hash: receipt.hash })
    await refresh()
  }

  return {
    onApproveUSDC,
    onApproveDSU,
    onApproveShares,
    onDeposit,
    onRedeem,
    onClaim,
  }
}

const convertAssetsToShares = async ({
  vaultType,
  assets,
  chainId,
}: {
  vaultType: PerennialVaultType
  assets: bigint
  chainId: SupportedChainId
}): Promise<bigint> => {
  const vault = getVaultForType(vaultType, chainId)
  if (!vault) {
    return 0n
  }
  const vaultAddress = vault.address
  const [long, short] = await Promise.all([vault.read.long(), vault.read.short()])

  const longProduct = getProductContract(long, chainId)
  const shortProduct = getProductContract(short, chainId)

  const [, , , shares] = await Promise.all([
    longProduct.read.settleAccount([vaultAddress]),
    shortProduct.read.settleAccount([vaultAddress]),
    trySync(vault),
    vault.read.convertToShares([assets]),
  ])

  return shares
}

const bufferGasLimit = (estimatedGas: bigint) => {
  return Big18Math.div(Big18Math.mul(estimatedGas, 3n), 2n)
}

const trySync = async (
  vault: GetContractResult<typeof BalancedVaultAbi>,
  { blockNumber }: { blockNumber?: BlockNumber } = {},
) => {
  try {
    await vault.read.sync({ blockNumber })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
