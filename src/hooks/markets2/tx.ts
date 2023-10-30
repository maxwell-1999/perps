import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { Address, Hex, getAddress, zeroAddress } from 'viem'
import { useNetwork, useWalletClient } from 'wagmi'
import { waitForTransaction } from 'wagmi/actions'

import { useAdjustmentModalCopy } from '@/components/pages/Trade/TradeForm/components/AdjustPositionModal/hooks'
import { OrderTypes } from '@/components/pages/Trade/TradeForm/constants'
import { useTransactionToasts, useTxToastCopy } from '@/components/shared/Toast/transactionToasts'
import { MultiInvoker2Addresses } from '@/constants/contracts'
import { PositionSide2, TriggerComparison, addressToAsset2 } from '@/constants/markets'
import { interfaceFeeBps, metamaskTxRejectedError } from '@/constants/network'
import { MaxUint256 } from '@/constants/units'
import { notEmpty } from '@/utils/arrayUtils'
import { Big6Math, BigOrZero } from '@/utils/big6Utils'
import { getOracleContract, getPythProviderContract } from '@/utils/contractUtils'
import {
  buildCancelOrder,
  buildCommitPrice,
  buildInterfaceFee,
  buildPlaceTriggerOrder,
  buildUpdateMarket,
} from '@/utils/multiinvoker2'
import { buildCommitmentsForOracles, getRecentVaa } from '@/utils/pythUtils'
import { nowSeconds } from '@/utils/timeUtils'

import { MultiInvoker2Action } from '@t/perennial'

import { useMultiInvoker2, useUSDC } from '../contracts'
import { useAddress, useChainId, usePyth } from '../network'
import { useMarketOracles2, useMarketSnapshots2 } from './chain'
import { OpenOrder } from './graph'

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
          ['marketSnapshots2', 'marketPnls2', 'balances', 'openOrders'].includes(queryKey.at(0) as string) &&
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
    stopLoss,
    takeProfit,
    settlementFee,
    cancelOrderDetails,
  }: {
    txHistoryLabel?: string
    collateralDelta?: bigint
    positionAbs?: bigint
    positionSide?: PositionSide2
    interfaceFee?: bigint
    stopLoss?: bigint
    takeProfit?: bigint
    settlementFee?: bigint
    cancelOrderDetails?: OpenOrder[]
  } = {}) => {
    if (!address || !chainId || !walletClient || !marketOracles || !pyth) {
      return
    }

    let cancelOrders: { action: number; args: `0x${string}` }[] = []

    if (cancelOrderDetails?.length) {
      cancelOrders = cancelOrderDetails.map(({ market, nonce }) =>
        buildCancelOrder({ market: getAddress(market), nonce: BigInt(nonce) }),
      )
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

    const isNotMaker = positionSide !== PositionSide2.maker && positionSide !== PositionSide2.none
    // TODO: stopLoss and takeProfit
    let stopLossAction
    if (stopLoss && positionSide && isNotMaker && settlementFee) {
      stopLossAction = buildPlaceTriggerOrder({
        market: productAddress,
        side: positionSide,
        triggerPrice: stopLoss,
        comparison: positionSide === PositionSide2.short ? 'gte' : 'lte',
        maxFee: settlementFee * 2n,
        delta: -(positionAbs ?? 0n),
      })
    }

    let takeProfitAction
    if (takeProfit && positionSide && isNotMaker && settlementFee) {
      takeProfitAction = buildPlaceTriggerOrder({
        market: productAddress,
        side: positionSide,
        triggerPrice: takeProfit,
        comparison: positionSide === PositionSide2.short ? 'lte' : 'gte',
        delta: -(positionAbs ?? 0n),
        maxFee: settlementFee * 2n,
      })
    }

    const actions: MultiInvoker2Action[] = [
      updateAction,
      chargeFeeAction,
      stopLossAction,
      takeProfitAction,
      ...cancelOrders,
    ].filter(notEmpty)

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

  const onPlaceOrder = async ({
    orderType,
    limitPrice,
    collateralDelta,
    stopLoss,
    takeProfit,
    side,
    delta = 0n,
    settlementFee,
    positionAbs,
    selectedLimitComparison,
    cancelOrderDetails,
  }: {
    orderType: OrderTypes
    limitPrice?: bigint
    stopLoss?: bigint
    takeProfit?: bigint
    side: PositionSide2
    collateralDelta?: bigint
    delta: bigint
    settlementFee: bigint
    positionAbs: bigint
    selectedLimitComparison?: TriggerComparison
    cancelOrderDetails?: { market: Address; nonce: bigint }
  }) => {
    if (!address || !chainId || !walletClient || !marketOracles || !pyth) {
      return
    }

    let cancelAction
    let updateAction
    let limitOrderAction
    let stopLossAction
    let takeProfitAction

    if (cancelOrderDetails) {
      cancelAction = buildCancelOrder(cancelOrderDetails)
    }

    if (orderType === OrderTypes.limit && limitPrice) {
      if (collateralDelta) {
        updateAction = buildUpdateMarket({
          market: productAddress,
          maker: undefined,
          long: undefined,
          short: undefined,
          collateral: collateralDelta,
          wrap: true,
        })
      }
      limitOrderAction = buildPlaceTriggerOrder({
        market: productAddress,
        side: side as PositionSide2.long | PositionSide2.short,
        triggerPrice: limitPrice,
        comparison: selectedLimitComparison ? selectedLimitComparison : side === PositionSide2.long ? 'lte' : 'gte',
        maxFee: settlementFee * 2n,
        delta,
      })
    }

    if (stopLoss && orderType !== OrderTypes.takeProfit) {
      stopLossAction = buildPlaceTriggerOrder({
        market: productAddress,
        side: side as PositionSide2.long | PositionSide2.short,
        triggerPrice: stopLoss,
        comparison: side === PositionSide2.short ? 'gte' : 'lte',
        maxFee: settlementFee * 2n,
        delta: orderType === OrderTypes.limit ? -positionAbs : delta,
      })
    }

    if (takeProfit && orderType !== OrderTypes.stopLoss) {
      takeProfitAction = buildPlaceTriggerOrder({
        market: productAddress,
        side: side as PositionSide2.long | PositionSide2.short,
        triggerPrice: takeProfit,
        comparison: side === PositionSide2.short ? 'lte' : 'gte',
        maxFee: settlementFee * 2n,
        delta: orderType === OrderTypes.limit ? -positionAbs : delta,
      })
    }

    const actions: MultiInvoker2Action[] = [
      cancelAction,
      updateAction,
      limitOrderAction,
      stopLossAction,
      takeProfitAction,
    ].filter(notEmpty)

    if (orderType === OrderTypes.limit && collateralDelta) {
      const oracleInfo = Object.values(marketOracles).find((o) => o.marketAddress === productAddress)
      if (!oracleInfo) return
      const asset = addressToAsset2(productAddress)
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
    }

    try {
      const hash = await multiInvoker.write.invoke([actions], { ...txOpts, value: 1n })
      waitForTransaction({ hash })
        .then(() => refresh())
        .catch(() => null)
      // Refresh after a timeout to catch missed events
      setTimeout(() => refresh(), 15000)
      setTimeout(() => refresh(), 30000)
      return hash
    } catch (err: any) {
      if (err.details !== metamaskTxRejectedError) {
        triggerErrorToast({ title: errorToastCopy.error, message: errorToastCopy.errorPlacingOrder })
      }
      console.error(err)
    }
  }

  return {
    onPlaceOrder,
    onApproveUSDC,
    onModifyPosition,
    onSubmitVaa,
  }
}

export const useCancelOrder = () => {
  const chainId = useChainId()
  const errorToastCopy = useTxToastCopy()
  const { chain } = useNetwork()
  const { triggerErrorToast } = useTransactionToasts()

  const { address } = useAddress()
  const { data: walletClient } = useWalletClient()

  const multiInvoker = useMultiInvoker2(walletClient ?? undefined)
  const txOpts = { account: address || zeroAddress, chainId, chain }
  const queryClient = useQueryClient()
  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => ['openOrders'].includes(queryKey.at(0) as string) && queryKey.includes(chainId),
      }),
    [queryClient, chainId],
  )

  const onCancelOrder = async (orderDetails: [Address, bigint][]) => {
    if (!address || !chainId || !walletClient) {
      return
    }

    const actions: MultiInvoker2Action[] = orderDetails.map(([market, nonce]) =>
      buildCancelOrder({
        market,
        nonce,
      }),
    )

    try {
      const hash = await multiInvoker.write.invoke([actions], { ...txOpts, value: 1n })
      waitForTransaction({ hash })
        .then(() => refresh())
        .catch(() => null)
      // Refresh after a timeout to catch missed events
      setTimeout(() => refresh(), 15000)
      return hash
    } catch (err: any) {
      if (err.details !== metamaskTxRejectedError) {
        triggerErrorToast({ title: errorToastCopy.error, message: errorToastCopy.errorCancelingOrder })
      }
      console.error(err)
      throw new Error(err)
    }
  }

  return onCancelOrder
}
