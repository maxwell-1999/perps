import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { Address, BlockNumber, getAbiItem, zeroAddress } from 'viem'
import { PublicClient, useNetwork, usePublicClient, useWalletClient } from 'wagmi'
import { GetContractResult, waitForTransaction } from 'wagmi/actions'

import { MultiInvokerAddresses } from '@/constants/contracts'
import { SupportedChainId } from '@/constants/network'
import { MaxUint256 } from '@/constants/units'
import { PerennialVaultType } from '@/constants/vaults'
import { notEmpty, sum as sumArray } from '@/utils/arrayUtils'
import { Big18Math } from '@/utils/big18Utils'
import { InvokerAction, buildInvokerAction } from '@/utils/multiinvoker'

import { BalancedVaultAbi } from '@abi/BalancedVault.abi'
import { LensProductSnapshotAbi, LensUserProductSnapshotAbi } from '@abi/Lens.abi'

import { getProductContract, getVaultAddressForType, getVaultForType } from '../utils/contractUtils'
import { useDSU, useLensProductSnapshot, useLensUserProductSnapshot, useMultiInvoker, useUSDC } from './contracts'
import { useRefreshKeysOnPriceUpdates } from './markets'
import { useAddress, useChainId } from './network'

export const useVaultSnapshots = (vaultTypes: PerennialVaultType[]) => {
  const chainId = useChainId()
  const lensProductSnapshot = useLensProductSnapshot()
  const lensUserProductSnapshot = useLensUserProductSnapshot()

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
    vaultType,
    address: vaultAddress,
    name,
    symbol,
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

export const useVaultUserSnapshot = (vaultType: PerennialVaultType) => {
  const chainId = useChainId()
  const client = usePublicClient()
  const { address } = useAddress()
  const vaultContract = getVaultForType(vaultType, chainId)

  return useQuery({
    queryKey: ['vaultUserSnapshot', chainId, vaultType, address],
    enabled: !!chainId && !!address && !!vaultType && !!vaultContract,
    queryFn: async () => {
      if (!address || !chainId || !vaultContract) return
      return vaultUserFetcher(address, vaultContract, chainId, client)
    },
  })
}

export const useVaultFeeAPRs = () => {
  const chainId = useChainId()

  return useQuery({
    queryKey: ['vaultFeeAPRs', chainId],
    enabled: !!chainId,
    queryFn: async () => {
      if (!chainId) return
      const res = await fetch(`/api/vault_fee_aprs?chainId=${chainId}`)
      if (!res.ok) return { alpha: undefined, bravo: undefined }

      const data: { [key in PerennialVaultType]?: number } = await res.json()

      return {
        alpha: data.alpha ? Big18Math.fromFloatString(data.alpha.toString()) : undefined,
        bravo: data.bravo ? Big18Math.fromFloatString(data.bravo.toString()) : undefined,
      }
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

  const deposits = _deposits.sort((a, b) => Big18Math.cmp(b.args.version, a.args.version))
  const claims = _claims.sort((a, b) => Big18Math.cmp(b.blockNumber ?? 0n, a.blockNumber ?? 0n))
  const redemptions = _redemptions.sort((a, b) => Big18Math.cmp(b.args.version, a.args.version))

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
    assets: assets < 100n ? 0n : assets,
    claimable,
    totalDeposit: sumArray(_deposits.map((e) => e.args.assets)),
    totalClaim: sumArray(_claims.map((e) => e.args.assets)),
    currentPositionDeposits: sumArray(
      _deposits.filter((e) => (e.blockNumber ?? 0n) > currentPositionStartBlock).map((e) => e.args.assets),
    ),
    currentPositionClaims: sumArray(
      _claims.filter((e) => (e.blockNumber ?? 0n) > currentPositionStartBlock).map((e) => e.args.assets),
    ),
    // Sort redemptions as most recent first
    deposits,
    claims,
    redemptions,
    pendingRedemptionAmount,
    pendingDepositAmount,
  }
}

const useVaultTransactionCopy = () => {
  const intl = useIntl()
  return {
    approveUSDC: intl.formatMessage({ defaultMessage: 'Approve USDC' }),
    approveDSU: intl.formatMessage({ defaultMessage: 'Approve DSU' }),
    approveShares: intl.formatMessage({ defaultMessage: 'Approve Shares' }),
    depositCollateral: intl.formatMessage({ defaultMessage: 'Deposit Collateral' }),
    redeemCollateral: intl.formatMessage({ defaultMessage: 'Redeem Collateral' }),
    claimCollateral: intl.formatMessage({ defaultMessage: 'Claim Collateral' }),
  }
}

export const useRefreshVaultsOnPriceUpdates = () => {
  const keys = ['vaultSnapshots', 'vaultUserSnapshot']
  useRefreshKeysOnPriceUpdates(keys)
}

export type VaultTransactions = {
  onApproveUSDC: () => Promise<`0x${string}`>
  onApproveDSU: () => Promise<`0x${string}`>
  onApproveShares: () => Promise<`0x${string}` | undefined>
  onDeposit: (amount: bigint) => Promise<`0x${string}` | undefined>
  onRedeem: (amount: bigint, { assets, max }: { assets?: boolean; max?: boolean }) => Promise<`0x${string}` | undefined>
  onClaim: (unwrapAmount?: bigint) => Promise<`0x${string}` | undefined>
}
export const useVaultTransactions = (vaultType: PerennialVaultType): VaultTransactions => {
  const { chain } = useNetwork()
  const chainId = useChainId()
  const { address } = useAddress()
  const { data: walletClient } = useWalletClient({ chainId })
  const addRecentTransaction = useAddRecentTransaction()
  const copy = useVaultTransactionCopy()

  const usdcContract = useUSDC(walletClient ?? undefined)
  const dsuContract = useDSU(walletClient ?? undefined)
  const multiInvoker = useMultiInvoker(walletClient ?? undefined)

  const queryClient = useQueryClient()

  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          ['vaultSnapshots', 'vaultUserSnapshot', 'vaultAllowances', 'balances'].includes(queryKey.at(0) as string) &&
          queryKey.includes(chainId),
      }),
    [chainId, queryClient],
  )

  const txOpts = { account: address || zeroAddress, chainId, chain }
  const onApproveUSDC = async () => {
    const hash = await usdcContract.write.approve([MultiInvokerAddresses[chainId], MaxUint256], txOpts)
    await waitForTransaction({ hash })
    await refresh()
    addRecentTransaction({
      hash,
      description: copy.approveUSDC,
    })
    return hash
  }

  const onApproveDSU = async () => {
    const hash = await dsuContract.write.approve([MultiInvokerAddresses[chainId], MaxUint256], txOpts)
    await waitForTransaction({ hash })
    await refresh()
    addRecentTransaction({
      hash,
      description: copy.approveDSU,
    })
    return hash
  }

  const onApproveShares = async () => {
    if (!walletClient) return
    const vaultContract = getVaultForType(vaultType, chainId, walletClient)
    if (!vaultContract) return

    const hash = await vaultContract.write.approve([MultiInvokerAddresses[chainId], MaxUint256], txOpts)
    await waitForTransaction({ hash })
    await refresh()
    addRecentTransaction({
      hash,
      description: copy.approveShares,
    })
    return hash
  }

  const onDeposit = async (amount: bigint) => {
    const vaultAddress = getVaultAddressForType(vaultType, chainId)
    if (!address || !chainId || !walletClient || !vaultAddress) return

    const actions = [
      buildInvokerAction(InvokerAction.VAULT_WRAP_AND_DEPOSIT, {
        userAddress: address,
        vaultAddress,
        vaultAmount: amount,
      }),
    ]
    // Extra buffer to account to changes to underlying state
    const gasLimit = await multiInvoker.estimateGas.invoke([actions], txOpts)
    const hash = await multiInvoker.write.invoke([actions], { ...txOpts, gas: bufferGasLimit(gasLimit) })
    await waitForTransaction({ hash })
    await refresh()
    addRecentTransaction({
      hash,
      description: copy.depositCollateral,
    })
    return hash
  }

  const onRedeem = async (amount: bigint, { assets = true, max = false }) => {
    const vaultContract = getVaultForType(vaultType, chainId)
    if (!address || !chainId || !walletClient || !vaultContract) {
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
    const gasLimit = await multiInvoker.estimateGas.invoke([actions], txOpts)
    const hash = await multiInvoker.write.invoke([actions], { ...txOpts, gas: bufferGasLimit(gasLimit) })
    await waitForTransaction({ hash })
    await refresh()
    addRecentTransaction({
      hash,
      description: copy.redeemCollateral,
    })
    return hash
  }

  const onClaim = async (unwrapAmount?: bigint) => {
    const vaultContract = getVaultForType(vaultType, chainId)
    if (!address || !vaultContract) {
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
    const gasLimit = await multiInvoker.estimateGas.invoke([actions], txOpts)
    const hash = await multiInvoker.write.invoke([actions], { ...txOpts, gas: bufferGasLimit(gasLimit) })
    await waitForTransaction({ hash })
    await refresh()
    addRecentTransaction({
      hash,
      description: copy.claimCollateral,
    })
    return hash
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

const bufferGasLimit = (estimatedGas: bigint) => (estimatedGas * 3n) / 2n

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
