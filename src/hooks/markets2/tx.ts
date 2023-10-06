import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { Address, Hex, zeroAddress } from 'viem'
import { useNetwork, useWalletClient } from 'wagmi'
import { waitForTransaction } from 'wagmi/actions'

import { useAdjustmentModalCopy } from '@/components/pages/Trade/TradeForm/components/AdjustPositionModal/hooks'
import { useTransactionToasts, useTxToastCopy } from '@/components/shared/Toast/transactionToasts'
import { MultiInvoker2Addresses } from '@/constants/contracts'
import { PositionSide2, addressToAsset2 } from '@/constants/markets'
import { interfaceFeeBps, metamaskTxRejectedError } from '@/constants/network'
import { MaxUint256 } from '@/constants/units'
import { notEmpty } from '@/utils/arrayUtils'
import { Big6Math, BigOrZero } from '@/utils/big6Utils'
import { getOracleContract, getPythProviderContract } from '@/utils/contractUtils'
import { buildCommitPrice, buildInterfaceFee, buildUpdateMarket } from '@/utils/multiinvoker2'
import { buildCommitmentsForOracles, getRecentVaa } from '@/utils/pythUtils'
import { nowSeconds } from '@/utils/timeUtils'

import { MultiInvoker2Action } from '@t/perennial'

import { useMultiInvoker2, useUSDC } from '../contracts'
import { useAddress, useChainId, usePyth } from '../network'
import { useMarketOracles2, useMarketSnapshots2 } from './chain'

export const useMarketTransactions2 = (productAddress: Address) => {
  const { chain } = useNetwork()
  const chainId = useChainId()
  const errorToastCopy = useTxToastCopy()
  const { triggerErrorToast } = useTransactionToasts()

  const { address } = useAddress()
  const { data: walletClient } = useWalletClient()
  const { data: marketOracles } = useMarketOracles2()
  const { data: marketSnapshots } = useMarketSnapshots2()
  const pyth = usePyth()
  const copy = useAdjustmentModalCopy()
  const addRecentTransaction = useAddRecentTransaction()

  const multiInvoker = useMultiInvoker2(walletClient ?? undefined)
  const usdcContract = useUSDC(walletClient ?? undefined)

  const queryClient = useQueryClient()
  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          ['marketSnapshots2', 'marketPnls2', 'balances'].includes(queryKey.at(0) as string) &&
          queryKey.includes(chainId),
      }),
    [queryClient, chainId],
  )

  const txOpts = { account: address || zeroAddress, chainId, chain }
  const onApproveUSDC = async (suggestedAmount: bigint = MaxUint256) => {
    if (!address) throw new Error('No Address')
    const hash = await usdcContract.write.approve(
      [MultiInvoker2Addresses[chainId], Big6Math.abs(suggestedAmount)],
      txOpts,
    )
    await waitForTransaction({ hash })
    await refresh()
    addRecentTransaction({
      hash,
      description: copy.approveUSDC,
    })
    const newAllowance = await usdcContract.read.allowance([address, MultiInvoker2Addresses[chainId]])
    return { hash, newAllowance }
  }

  const onModifyPosition = async ({
    positionSide,
    positionAbs,
    collateralDelta,
    txHistoryLabel,
    interfaceFee,
  }: {
    txHistoryLabel?: string
    collateralDelta?: bigint
    positionAbs?: bigint
    positionSide?: PositionSide2
    interfaceFee?: bigint
  } = {}) => {
    if (!address || !chainId || !walletClient || !marketOracles || !pyth) {
      return
    }

    const oracleInfo = Object.values(marketOracles).find((o) => o.marketAddress === productAddress)
    if (!oracleInfo) return
    const asset = addressToAsset2(productAddress)

    // Interface fee
    const interfaceFeeInfo = interfaceFeeBps[chainId]
    let chargeFeeAction
    if (interfaceFee && interfaceFeeInfo && interfaceFeeInfo.feeRecipientAddress !== zeroAddress) {
      chargeFeeAction = buildInterfaceFee({
        to: interfaceFeeInfo.feeRecipientAddress,
        amount: interfaceFee,
      })
    }

    const updateAction = buildUpdateMarket({
      market: productAddress,
      maker: positionSide === PositionSide2.maker ? positionAbs : undefined, // Absolute position size
      long: positionSide === PositionSide2.long ? positionAbs : undefined,
      short: positionSide === PositionSide2.short ? positionAbs : undefined,
      collateral: (collateralDelta ?? 0n) - (interfaceFee ?? 0n), // Delta collateral
      wrap: true,
    })

    const actions: MultiInvoker2Action[] = [updateAction, chargeFeeAction].filter(notEmpty)

    let isPriceStale = false
    if (asset && marketSnapshots?.market[asset]) {
      const {
        parameter: { maxPendingGlobal, maxPendingLocal },
        riskParameter: { staleAfter },
        pendingPositions,
      } = marketSnapshots.market[asset]
      const lastUpdated = await getOracleContract(oracleInfo.address, chainId).read.latest()
      isPriceStale = BigInt(nowSeconds()) - lastUpdated.timestamp > staleAfter / 2n
      // If there is a backlog of pending positions, we need to commit the price
      isPriceStale = isPriceStale || BigInt(pendingPositions.length) >= maxPendingGlobal
      // If there is a backlog of pending positions for this user, we need to commit the price
      isPriceStale =
        isPriceStale || BigOrZero(marketSnapshots.user?.[asset]?.pendingPositions?.length) >= maxPendingLocal
    }

    // Only add the price commit if the price is stale
    if (isPriceStale) {
      const [{ version, index, value, updateData }] = await buildCommitmentsForOracles({
        chainId,
        pyth,
        marketOracles: [oracleInfo],
        onError: () => triggerErrorToast({ title: errorToastCopy.error, message: errorToastCopy.errorFetchingPrice }),
      })

      const commitAction = buildCommitPrice({
        oracle: oracleInfo.providerAddress,
        version,
        value,
        index,
        vaa: updateData,
        revertOnFailure: false,
      })

      actions.unshift(commitAction)
    }

    try {
      const hash = await multiInvoker.write.invoke([actions], { ...txOpts, value: 1n })
      waitForTransaction({ hash })
        .then(() => refresh())
        .catch(() => null)
      addRecentTransaction({
        hash,
        description: txHistoryLabel || copy.positionChanged,
      })
      // Refresh after a timeout to catch missed events
      setTimeout(() => refresh(), 15000)
      setTimeout(() => refresh(), 30000)
      // TODO: non-blocking waitForTransaction and show an error if the tx reverts on chain
      return hash
    } catch (err: any) {
      // Ignore metamask tx rejected error
      if (err.details !== metamaskTxRejectedError) {
        triggerErrorToast({ title: errorToastCopy.error, message: errorToastCopy.errorPlacingOrder })
      }

      console.error(err)
    }
  }

  const onSubmitVaa = async () => {
    if (!address || !chainId || !walletClient || !marketOracles || !pyth) {
      return
    }

    const oracleInfo = Object.values(marketOracles).find((o) => o.marketAddress === productAddress)
    if (!oracleInfo) return

    const [{ version, vaa }] = await getRecentVaa({
      pyth,
      feeds: [oracleInfo],
    })

    try {
      const oracleProvider = getPythProviderContract(oracleInfo.providerAddress, chainId, walletClient)
      const hash = await oracleProvider.write.commit(
        [await oracleProvider.read.versionListLength(), version, vaa as Hex],
        { ...txOpts, value: 1n },
      )
      await waitForTransaction({ hash })
        .then(() => refresh())
        .catch(() => null)
      return hash
    } catch (err: any) {
      // Ignore metamask tx rejected error
      if (err.details !== metamaskTxRejectedError) {
        triggerErrorToast({ title: errorToastCopy.error, message: errorToastCopy.errorPlacingOrder })
      }

      console.error(err)
    }
  }

  // TODO: onPlaceOrder, onCancelOrder

  return {
    onApproveUSDC,
    onModifyPosition,
    onSubmitVaa,
  }
}
