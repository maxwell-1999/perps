import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BlockTag, Provider } from 'ethers'
import { useCallback } from 'react'
import { Hex, getAddress } from 'viem'
import { useSendTransaction, useWalletClient } from 'wagmi'
import { waitForTransaction } from 'wagmi/actions'

import { MultiInvokerAddresses } from '@/constants/contracts'
import { MaxUint256 } from '@/constants/markets'
import { SupportedChainId, SupportedChainIds } from '@/constants/network'
import { PerennialVaultType, VaultSymbol, VaultUserSnapshot } from '@/constants/vaults'
import { VaultSnapshot } from '@/constants/vaults'
import { sum as sumArray } from '@/utils/arrayUtils'
import { Big18Math } from '@/utils/big18Utils'
import { InvokerAction, buildInvokerAction } from '@/utils/multiinvoker'
import { ethersResultToPOJO } from '@/utils/objectUtils'

import { BalancedVaultAbi, LensAbi } from '@t/generated'

import { getProductContract, getVaultForType } from '../utils/contractUtils'
import { useLens, useMultiInvoker, useMulticallContract, useUSDC } from './contracts'
import { useAddress, useChainId, useMulticallProvider } from './network'

export const useVaultSnapshots = (vaultTypes: PerennialVaultType[]) => {
  const chainId = useChainId()
  const provider = useMulticallProvider()
  const _lens = useLens()
  const lens = useMulticallContract(_lens)

  return useQuery({
    queryKey: ['vaultSnapshots', vaultTypes, chainId],
    enabled: !!chainId,
    refetchInterval: 10000,
    queryFn: () => {
      if (!vaultTypes.length) {
        return Promise.resolve([])
      }
      return Promise.all(vaultTypes.map((vaultType) => vaultFetcher(vaultType, chainId, provider, lens))).then(
        (results) => results.filter((result): result is VaultSnapshot => result !== undefined),
      )
    },
  })
}

const vaultFetcher = async (
  vaultType: PerennialVaultType,
  chainId: SupportedChainId,
  provider: Provider,
  lens: LensAbi,
): Promise<VaultSnapshot | undefined> => {
  const vaultContract = getVaultForType(vaultType, chainId, provider)
  if (!vaultContract) {
    return Promise.resolve(undefined)
  }
  const [name, symbol, long, short, targetLeverage, maxCollateral, vaultAddress] = await Promise.all([
    vaultContract.name(),
    vaultContract.symbol(),
    vaultContract.long(),
    vaultContract.short(),
    vaultContract.targetLeverage(),
    vaultContract.maxCollateral(),
    vaultContract.getAddress(),
  ])

  const [longSnapshot, shortSnapshot, longUserSnapshot, shortUserSnapshot, canSync, totalSupply, totalAssets] =
    await Promise.all([
      lens['snapshot(address)'].staticCall(long),
      lens['snapshot(address)'].staticCall(short),
      lens['snapshot(address,address)'].staticCall(vaultAddress, long),
      lens['snapshot(address,address)'].staticCall(vaultAddress, short),
      trySync(vaultContract),
      vaultContract.totalSupply(),
      vaultContract.totalAssets(),
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
    longSnapshot: ethersResultToPOJO(longSnapshot),
    shortSnapshot: ethersResultToPOJO(shortSnapshot),
    longUserSnapshot: ethersResultToPOJO(longUserSnapshot),
    shortUserSnapshot: ethersResultToPOJO(shortUserSnapshot),
    canSync,
  }
}

export const useVaultUserSnapshot = (vaultSymbol: VaultSymbol) => {
  const chainId = useChainId()
  const provider = useMulticallProvider()
  const { address } = useAddress()
  const vaultType = [VaultSymbol.PVA, VaultSymbol.ePBV].includes(vaultSymbol)
    ? PerennialVaultType.alpha
    : PerennialVaultType.bravo

  return useQuery({
    queryKey: ['vaultUserSnapshot', chainId, vaultSymbol, address],
    enabled: !!chainId && !!address && !!vaultSymbol,
    queryFn: async (): Promise<VaultUserSnapshot | undefined> => {
      const vaultContract = getVaultForType(vaultType, chainId, provider)
      if (!address || !chainId || !vaultSymbol || !vaultContract) return
      const depositsQuery = vaultContract.filters.Deposit(undefined, address)
      const claimsQuery = vaultContract.filters.Claim(undefined, address)
      const redemptionsQuery = vaultContract.filters.Redemption(undefined, address)

      const [long, short, _deposits, _claims, _redemptions, vaultAddress] = await Promise.all([
        vaultContract.long(),
        vaultContract.short(),
        vaultContract.queryFilter(depositsQuery),
        vaultContract.queryFilter(claimsQuery),
        vaultContract.queryFilter(redemptionsQuery),
        vaultContract.getAddress(),
      ])

      const longProduct = getProductContract(long, provider)
      const shortProduct = getProductContract(short, provider)

      const [, , , balance] = await Promise.all([
        longProduct['settleAccount'].staticCall(vaultAddress),
        shortProduct['settleAccount'].staticCall(vaultAddress),
        trySync(vaultContract),
        vaultContract.balanceOf(address),
      ])

      const [, , , latestVersion, assets, claimable] = await Promise.all([
        longProduct['settleAccount'].staticCall(vaultAddress),
        shortProduct['settleAccount'].staticCall(vaultAddress),
        trySync(vaultContract),
        longProduct['latestVersion()'].staticCall(),
        vaultContract.convertToAssets(balance),
        vaultContract.unclaimed(address),
      ])
      const deposits = _deposits.sort((a, b) => Big18Math.subFixed(b.args.version, a.args.version).toUnsafeFloat())
      const claims = _claims.sort((a, b) => b.blockNumber - a.blockNumber)
      const redemptions = _redemptions.sort((a, b) =>
        Big18Math.subFixed(b.args.version, a.args.version).toUnsafeFloat(),
      )

      let pendingRedemptionAmount = 0n
      if (redemptions.length && redemptions[0].args.version >= latestVersion) {
        pendingRedemptionAmount = redemptions[0].args.shares
      }

      let pendingDepositAmount = 0n
      if (deposits.length && deposits[0].args.version >= latestVersion) {
        pendingDepositAmount = deposits[0].args.assets
      }

      let currentPositionStartBlock = (deposits.at(-1)?.blockNumber || 0) - 1
      for (const claim of claims) {
        const [, balance] = await Promise.all([
          trySync(vaultContract, { blockTag: claim.blockNumber }),
          vaultContract.balanceOf(address, { blockTag: claim.blockNumber }),
        ])
        if (balance < BigInt(100)) {
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
          _deposits.filter((e) => e.blockNumber > currentPositionStartBlock).map((e) => e.args.assets),
        ),
        currentPositionClaims: sumArray(
          _claims.filter((e) => e.blockNumber > currentPositionStartBlock).map((e) => e.args.assets),
        ),
        // Sort redemptions as most recent first
        deposits,
        claims,
        redemptions,
        pendingRedemptionAmount,
        pendingDepositAmount,
      }
    },
  })
}

export type VaultTransactions = {
  onApproveUSDC: () => Promise<void>
  onApproveShares: () => Promise<void>
  onDeposit: (amount: bigint) => Promise<void>
  onRedeem: (amount: bigint, { assets, max }: { assets?: boolean; max?: boolean }) => Promise<void>
  onClaim: (unwrapAmount?: bigint) => Promise<void>
}

export const useVaultTransactions = (vaultType: PerennialVaultType): VaultTransactions => {
  const { address } = useAddress()
  const chainId = useChainId()
  const provider = useMulticallProvider()
  const usdcContract = useUSDC()
  const multiInvoker = useMultiInvoker()
  const { data: walletClient } = useWalletClient()

  const queryClient = useQueryClient()
  const { sendTransactionAsync } = useSendTransaction()

  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: ['vaultAllowances', chainId, vaultType, address],
        predicate: ({ queryKey }) =>
          ['vaultSnapshot', 'vaultUserSnapshot', 'vaultAllowances', 'balances'].includes(queryKey.at(0) as string) &&
          queryKey.includes(chainId),
      }),
    [address, chainId, queryClient, vaultType],
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

  const onApproveShares = async () => {
    const vaultContract = getVaultForType(vaultType, chainId, provider)
    if (!address || !chainId || !SupportedChainIds.includes(chainId) || !vaultContract) {
      return
    }

    const txData = await vaultContract.approve.populateTransaction(MultiInvokerAddresses[chainId], MaxUint256)
    const receipt = await sendTransactionAsync({
      chainId,
      to: getAddress(txData.to),
      data: txData.data as Hex,
      account: walletClient?.account,
    })
    await waitForTransaction({ hash: receipt.hash })
    await refresh()
  }

  const onDeposit = async (amount: bigint) => {
    const vaultContract = getVaultForType(vaultType, chainId, provider)
    if (!address || !chainId || !SupportedChainIds.includes(chainId) || !vaultContract) {
      return
    }

    const vaultAddress = await vaultContract.getAddress()

    const actions = [
      buildInvokerAction(InvokerAction.VAULT_WRAP_AND_DEPOSIT, {
        userAddress: address,
        vaultAddress: vaultAddress,
        vaultAmount: amount,
      }),
    ]

    try {
      // Extra buffer to account to changes to underlying state
      const gasLimit = await multiInvoker.invoke.estimateGas(actions)
      const txData = await multiInvoker.invoke.populateTransaction(actions, { gasLimit: bufferGasLimit(gasLimit) })
      const receipt = await sendTransactionAsync({
        chainId,
        to: getAddress(txData.to),
        data: txData.data as Hex,
        account: walletClient?.account,
      })
      await waitForTransaction({ hash: receipt.hash })
      await refresh()
    } catch (e) {
      console.error(e)
    }
  }

  const onRedeem = async (amount: bigint, { assets = true, max = false }) => {
    const vaultContract = getVaultForType(vaultType, chainId, provider)
    if (!address || !chainId || !SupportedChainIds.includes(chainId) || !vaultContract) {
      return
    }

    const vaultAddress = await vaultContract.getAddress()
    let vaultAmount = max ? await vaultContract.balanceOf(address) : amount
    if (assets) {
      vaultAmount = await convertAssetsToShares({ vaultType, provider, assets: amount, chainId })
    }

    const actions = [
      buildInvokerAction(InvokerAction.VAULT_REDEEM, {
        userAddress: address,
        vaultAddress: vaultAddress,
        vaultAmount,
      }),
    ]

    try {
      // Extra buffer to account to changes to underlying state
      const gasLimit = await multiInvoker.invoke.estimateGas(actions)
      const txData = await multiInvoker.invoke.populateTransaction(actions, { gasLimit: bufferGasLimit(gasLimit) })
      const receipt = await sendTransactionAsync({
        chainId,
        to: getAddress(txData.to),
        data: txData.data as Hex,
        account: walletClient?.account,
      })
      await waitForTransaction({ hash: receipt.hash })
      await refresh()
    } catch (e) {
      console.error(e)
    }
  }

  const onClaim = async (unwrapAmount?: bigint) => {
    const vaultContract = getVaultForType(vaultType, chainId, provider)
    if (!address || !chainId || !SupportedChainIds.includes(chainId) || !vaultContract) {
      return
    }
    const vaultAddress = await vaultContract.getAddress()

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

    try {
      // Extra buffer to account to changes to underlying state
      const gasLimit = await multiInvoker.invoke.estimateGas(actions)
      const txData = await multiInvoker.invoke.populateTransaction(actions, { gasLimit: bufferGasLimit(gasLimit) })
      const receipt = await sendTransactionAsync({
        chainId,
        to: getAddress(txData.to),
        data: txData.data as Hex,
        account: walletClient?.account,
      })
      await waitForTransaction({ hash: receipt.hash })
      await refresh()
    } catch (e) {
      console.error(e)
    }
  }

  return {
    onApproveUSDC,
    onApproveShares,
    onDeposit,
    onRedeem,
    onClaim,
  }
}

const convertAssetsToShares = async ({
  vaultType,
  provider,
  assets,
  chainId,
}: {
  vaultType: PerennialVaultType
  provider: Provider
  assets: bigint
  chainId: SupportedChainId
}): Promise<bigint> => {
  const vault = getVaultForType(vaultType, chainId, provider)
  if (!vault) {
    return 0n
  }
  const [long, short, vaultAddress] = await Promise.all([vault.long(), vault.short(), vault.getAddress()])

  const longProduct = getProductContract(long, provider)
  const shortProduct = getProductContract(short, provider)

  const [, , , shares] = await Promise.all([
    longProduct['settleAccount'].staticCall(vaultAddress),
    shortProduct['settleAccount'].staticCall(vaultAddress),
    trySync(vault),
    vault.convertToShares(assets),
  ])

  return shares
}

const bufferGasLimit = (estimatedGas: bigint) => {
  return Big18Math.div(Big18Math.mul(estimatedGas, 3n), 2n)
}

const trySync = async (vault: BalancedVaultAbi, { blockTag }: { blockTag?: BlockTag } = {}) => {
  try {
    await vault.sync.staticCall({ blockTag })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
