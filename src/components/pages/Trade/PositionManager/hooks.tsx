import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { Address, getAddress } from 'viem'

import {
  AssetMetadata,
  PositionSide2,
  PositionStatus,
  SupportedAsset,
  TriggerComparison,
  addressToAsset2,
} from '@/constants/markets'
import { PositionsTab, useMarketContext } from '@/contexts/marketContext'
import {
  LivePrices,
  MarketSnapshot,
  OpenOrder,
  UserMarketSnapshot,
  useActivePositionMarketPnls,
  useMarket7dData,
  useOpenOrders,
} from '@/hooks/markets2'
import { Big6Math, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import { calcFundingRates, calcMakerExposure, calcMakerStats2 } from '@/utils/positionUtils'

import { OrderTypes } from '../TradeForm/constants'
import { PositionTableData } from './constants'
import { getFormattedPositionDetails, transformPositionDataToArray } from './utils'

export const useStyles = () => {
  const theme = useTheme()
  const borderColor = useColorModeValue(theme.colors.brand.blackAlpha[10], theme.colors.brand.whiteAlpha[10])
  const subheaderTextColor = useColorModeValue(theme.colors.brand.blackAlpha[50], theme.colors.brand.whiteAlpha[50])
  const alpha75 = useColorModeValue(theme.colors.brand.blackAlpha[75], theme.colors.brand.whiteAlpha[75])
  const alpha90 = useColorModeValue(theme.colors.brand.blackAlpha[90], theme.colors.brand.whiteAlpha[90])
  const alpha50 = useColorModeValue(theme.colors.brand.blackAlpha[50], theme.colors.brand.whiteAlpha[50])
  const alpha5 = useColorModeValue(theme.colors.brand.blackAlpha[5], theme.colors.brand.whiteAlpha[5])
  const alpha20 = useColorModeValue(theme.colors.brand.blackAlpha[20], theme.colors.brand.whiteAlpha[20])
  const alpha10 = useColorModeValue(theme.colors.brand.blackAlpha[10], theme.colors.brand.whiteAlpha[10])
  // TODO: light color theme background
  const background = '#141823'
  const green = theme.colors.brand.green
  const red = theme.colors.brand.red
  const purple = theme.colors.brand.purple[240]
  return {
    borderColor,
    green,
    red,
    subheaderTextColor,
    alpha75,
    alpha90,
    alpha5,
    alpha50,
    alpha10,
    alpha20,
    background,
    purple,
  }
}

export const usePositionManagerCopy = () => {
  const intl = useIntl()
  return {
    thisPosition: intl.formatMessage({ defaultMessage: 'This Position' }),
    allPositions: intl.formatMessage({ defaultMessage: 'All Positions' }),
    history: intl.formatMessage({ defaultMessage: 'History' }),
    open: intl.formatMessage({ defaultMessage: 'Open' }),
    closed: intl.formatMessage({ defaultMessage: 'Closed' }),
    opening: intl.formatMessage({ defaultMessage: 'Opening' }),
    closing: intl.formatMessage({ defaultMessage: 'Closing' }),
    pricing: intl.formatMessage({ defaultMessage: 'Pricing' }),
    resolved: intl.formatMessage({ defaultMessage: 'Resolved' }),
    failed: intl.formatMessage({ defaultMessage: 'Failed' }),
    failedTooltip: intl.formatMessage({ defaultMessage: 'Oracle Version not found for this order' }),
    liquidated: intl.formatMessage({ defaultMessage: 'Liquidated' }),
    long: intl.formatMessage({ defaultMessage: 'Long' }),
    short: intl.formatMessage({ defaultMessage: 'Short' }),
    maker: intl.formatMessage({ defaultMessage: 'Maker' }),
    size: intl.formatMessage({ defaultMessage: 'Size' }),
    openSize: intl.formatMessage({ defaultMessage: 'Open Size' }),
    pnl: intl.formatMessage({ defaultMessage: 'P&L' }),
    liquidationPrice: intl.formatMessage({ defaultMessage: 'Liquidation Price' }),
    averageEntry: intl.formatMessage({ defaultMessage: 'Average Entry' }),
    fundingRate1hr: intl.formatMessage({ defaultMessage: 'Funding Rate (1h)' }),
    collateral: intl.formatMessage({ defaultMessage: 'Collateral' }),
    sharePosition: intl.formatMessage({ defaultMessage: 'Share position' }),
    modify: intl.formatMessage({ defaultMessage: 'Modify' }),
    close: intl.formatMessage({ defaultMessage: 'Close' }),
    x: intl.formatMessage({ defaultMessage: 'x' }),
    noValue: intl.formatMessage({ defaultMessage: '--' }),
    direction: intl.formatMessage({ defaultMessage: 'Direction' }),
    withdraw: intl.formatMessage({ defaultMessage: 'Withdraw Collateral' }),
    market: intl.formatMessage({ defaultMessage: 'Market' }),
    liquidation: intl.formatMessage({ defaultMessage: 'Liquidation' }),
    loadMore: intl.formatMessage({ defaultMessage: 'Load more' }),
    fees: intl.formatMessage({ defaultMessage: 'Fees' }),
    change: intl.formatMessage({ defaultMessage: 'Change' }),
    executionPrice: intl.formatMessage({ defaultMessage: 'Execution Price' }),
    date: intl.formatMessage({ defaultMessage: 'Date' }),
    opened: intl.formatMessage({ defaultMessage: 'Opened' }),
    openLiq: intl.formatMessage({ defaultMessage: 'Open / Liq' }),
    leverage: intl.formatMessage({ defaultMessage: 'Leverage' }),
    status: intl.formatMessage({ defaultMessage: 'Status' }),
    noCurrentPositions: intl.formatMessage({ defaultMessage: 'No current positions to show' }),
    noHistoryPositions: intl.formatMessage({ defaultMessage: 'No position history to show' }),
    noPositionOpen: intl.formatMessage({ defaultMessage: 'No position open' }),
    noPnLToShow: intl.formatMessage({ defaultMessage: 'No P&L to show' }),
    fundingRate8hr: intl.formatMessage({ defaultMessage: 'Funding Rate (8h)' }),
    fundingRate24hr: intl.formatMessage({ defaultMessage: 'Funding Rate (24h)' }),
    fundingRateYearly: intl.formatMessage({ defaultMessage: 'Funding Rate (Year)' }),
    liquidationFee: intl.formatMessage({ defaultMessage: 'Liquidation Fee' }),
    connectWalletPositions: intl.formatMessage({ defaultMessage: 'Connect your wallet to see your positions' }),
    connectWalletHistory: intl.formatMessage({ defaultMessage: 'Connect your wallet to see your position history' }),
    exposure: intl.formatMessage({ defaultMessage: 'Exposure' }),
    fundingFeeAPR: intl.formatMessage({ defaultMessage: 'Est. Funding Fee APR' }),
    tradingFeeAPR: intl.formatMessage({ defaultMessage: 'Est. Trading Fee APR' }),
    totalAPR: intl.formatMessage({
      defaultMessage: 'Total APR',
    }),
    totalAprCalculationTooltip: intl.formatMessage(
      {
        defaultMessage:
          'Funding Fee APR + Trading Fee APR {br} APR values are calculated using the last 7 days of market activity',
      },
      { br: <br /> },
    ),
    unsettled: intl.formatMessage({ defaultMessage: 'Unsettled' }),
    unsettledTooltip: intl.formatMessage({
      defaultMessage:
        'This position has not yet been settled. PNL values will be available the next time you settle your position.',
    }),
    liquidationFeeTooltip: (feeAmount: bigint) =>
      intl.formatMessage(
        { defaultMessage: 'Liquidation Fee: {feeAmount}' },
        { feeAmount: formatBig6USDPrice(feeAmount) },
      ),
    orders: intl.formatMessage({ defaultMessage: 'Orders' }),
    type: intl.formatMessage({ defaultMessage: 'Type' }),
    noCurrentOrdersToShow: intl.formatMessage({ defaultMessage: 'No current orders to show' }),
    retry: intl.formatMessage({ defaultMessage: 'Retry' }),
    temporarilyLower: intl.formatMessage({ defaultMessage: 'Temporarily Lower' }),
    profitLoss: intl.formatMessage({ defaultMessage: 'Profit/Loss' }),
    funding: intl.formatMessage({ defaultMessage: 'Funding' }),
    marketFees: intl.formatMessage({ defaultMessage: 'Market Fees' }),
    tradingFees: intl.formatMessage({ defaultMessage: 'Trading Fees' }),
    sizeNotional: intl.formatMessage({ defaultMessage: 'Size (Notional)' }),
    plus: intl.formatMessage({ defaultMessage: '+' }),
    realized: intl.formatMessage({ defaultMessage: 'Realized' }),
    unrealized: intl.formatMessage({ defaultMessage: 'Unrealized' }),
    totalPNL: intl.formatMessage({ defaultMessage: 'Total P/L' }),
    triggerPrice: intl.formatMessage({ defaultMessage: 'Trigger Price' }),
    maxFee: intl.formatMessage({ defaultMessage: 'Max Exec Fee' }),
    cancelled: intl.formatMessage({ defaultMessage: 'Cancelled' }),
    limitOpen: intl.formatMessage({ defaultMessage: 'Limit Open' }),
    limitClose: intl.formatMessage({ defaultMessage: 'Limit Close' }),
    stopLoss: intl.formatMessage({ defaultMessage: 'Stop Loss' }),
    takeProfit: intl.formatMessage({ defaultMessage: 'Take Profit' }),
    placed: intl.formatMessage({ defaultMessage: 'Placed' }),
    invalid: intl.formatMessage({ defaultMessage: 'Invalid' }),
    invalidOrderMsg: intl.formatMessage({
      defaultMessage: 'This order cannot execute currently.',
    }),
    syncError: intl.formatMessage({ defaultMessage: 'Sync Error' }),
    syncErrorMessage: intl.formatMessage({
      defaultMessage: 'Error syncing latest data. Your position is not impacted. Try refreshing the page.',
    }),
    editing: intl.formatMessage({ defaultMessage: 'Editing' }),
  }
}

export const useFormatPosition = () => {
  const { assetMetadata, isMaker, userCurrentPosition, selectedMarketSnapshot2, selectedMakerMarket, orderDirection } =
    useMarketContext()
  const { noValue } = usePositionManagerCopy()
  const { data: market7dData } = useMarket7dData(selectedMakerMarket)

  const numSigFigs = assetMetadata.displayDecimals
  const minorSide = selectedMarketSnapshot2?.minorSide
  const { hourlyFunding, dailyFunding, eightHourFunding, yearlyFunding } = calcFundingRates(
    selectedMarketSnapshot2?.fundingRate[
      isMaker ? (minorSide as PositionSide2.long | PositionSide2.short) : orderDirection
    ],
  )

  const makerStats = isMaker
    ? calcMakerStats2({
        funding: market7dData?.makerAccumulation.funding ?? 0n,
        interest: market7dData?.makerAccumulation.interest ?? 0n,
        positionFee: market7dData?.makerAccumulation.positionFee ?? 0n,
        positionSize: userCurrentPosition?.nextPosition?.maker ?? 0n,
        collateral: userCurrentPosition?.local?.collateral ?? 0n,
      })
    : undefined

  const direction =
    userCurrentPosition?.status === PositionStatus.closing ? userCurrentPosition?.side : userCurrentPosition?.nextSide

  return {
    positionDetails: userCurrentPosition,
    formattedValues: {
      direction,
      dailyFunding: userCurrentPosition ? formatBig6Percent(dailyFunding, { numDecimals: 4 }) : noValue,
      hourlyFunding: userCurrentPosition ? formatBig6Percent(hourlyFunding, { numDecimals: 4 }) : noValue,
      eightHourFunding: userCurrentPosition ? formatBig6Percent(eightHourFunding, { numDecimals: 4 }) : noValue,
      yearlyFundingRate: userCurrentPosition ? formatBig6Percent(yearlyFunding, { numDecimals: 2 }) : noValue,
      fundingFeeAPR: !!makerStats ? formatBig6Percent(makerStats.fundingAPR, { numDecimals: 4 }) : noValue,
      tradingFeeAPR: !!makerStats ? formatBig6Percent(makerStats.positionFeeAPR, { numDecimals: 4 }) : noValue,
      isOpening: userCurrentPosition?.status === PositionStatus.opening,
      totalAPR: !!makerStats
        ? formatBig6Percent(makerStats.fundingAPR + makerStats.interestAPR + makerStats.positionFeeAPR, {
            numDecimals: 4,
          })
        : noValue,
      ...getFormattedPositionDetails({
        marketSnapshot: selectedMarketSnapshot2,
        userMarketSnapshot: userCurrentPosition,
        placeholderString: noValue,
        numSigFigs,
      }),
    },
  }
}

export const useOpenPositionTableData = () => {
  const { isMaker, snapshots2 } = useMarketContext()
  const { noValue } = usePositionManagerCopy()
  const transformedPositions = transformPositionDataToArray(snapshots2?.user, isMaker)

  const positions = transformedPositions
    .map((position) => {
      const numSigFigs = AssetMetadata[position.asset]?.displayDecimals ?? 2
      return {
        details: position.details as UserMarketSnapshot,
        asset: position.asset,
        symbol: position.symbol,
        isClosed: position.details.status === PositionStatus.closed,
        isClosing: position.details.status === PositionStatus.closing,
        triggerPrice: noValue,
        projectedFees: noValue,
        ...getFormattedPositionDetails({
          marketSnapshot: snapshots2?.market[position.asset],
          userMarketSnapshot: position.details,
          placeholderString: noValue,
          numSigFigs,
        }),
      }
    })
    .sort((a, b) => Big6Math.cmp(b.details?.nextMagnitude ?? 0n, a.details?.nextMagnitude ?? 0n))

  return {
    positions,
    status,
  }
}

export type FormattedOpenOrder = {
  status: string
  side: PositionSide2
  orderDelta: string
  orderDeltaNotional: string
  type: TriggerComparison
  triggerPrice: string
  triggerPriceUnformatted: bigint
  market: SupportedAsset
  transactionHash: string
  blockTimestamp: string
  projectedFee: string
  marketAddress: Address
  nonce: bigint
  details: OpenOrder
}

const orderIntToPositionSide = (orderSide: number) => {
  switch (orderSide) {
    case 0:
      return PositionSide2.maker
    case 1:
      return PositionSide2.long
    case 2:
      return PositionSide2.short
    default:
      return PositionSide2.none
  }
}

export const useOpenOrderTableData = (): FormattedOpenOrder[] => {
  const { isMaker } = useMarketContext()
  const { data: openOrders } = useOpenOrders(isMaker)
  const orders = openOrders?.pages
    .map((page) => page?.openOrders || [])
    .flat()
    .map((order) => {
      const market = addressToAsset2(getAddress(order.market)) as SupportedAsset
      const orderSize = BigInt(order.order_delta)
      const deltaNotional = Big6Math.mul(orderSize, BigInt(order.order_price))
      const type = order.order_comparison === -1 ? TriggerComparison.lte : TriggerComparison.gte

      return {
        status: 'open',
        side: orderIntToPositionSide(order.order_side),
        orderDelta: Big6Math.toFloatString(orderSize),
        orderDeltaNotional: formatBig6USDPrice(deltaNotional),
        type,
        triggerPrice: formatBig6USDPrice(BigInt(order.order_price)),
        triggerPriceUnformatted: BigInt(order.order_price),
        market,
        marketAddress: getAddress(order.market),
        nonce: BigInt(order.nonce),
        transactionHash: order.transactionHash,
        blockTimestamp: order.blockTimestamp,
        projectedFee: formatBig6USDPrice(BigInt(order.order_fee)),
        details: order,
      }
    })
  return orders || []
}

export const getOrderTypeFromOrder = (order: FormattedOpenOrder) => {
  if (BigInt(order.details.order_delta) > 0n) {
    return OrderTypes.limit
  }
  if (order.side === PositionSide2.long) {
    return order.type === TriggerComparison.lte ? OrderTypes.stopLoss : OrderTypes.takeProfit
  } else {
    return order.type === TriggerComparison.gte ? OrderTypes.stopLoss : OrderTypes.takeProfit
  }
}

export const usePnl2 = (
  userMarketSnapshot?: UserMarketSnapshot,
  marketSnapshot?: MarketSnapshot,
  livePrices?: LivePrices,
  failedClose?: boolean,
) => {
  const { data: pnlData } = useActivePositionMarketPnls()

  if (!pnlData || !userMarketSnapshot) return undefined
  const { asset, side, nextSide, nextMagnitude, magnitude } = userMarketSnapshot

  if (!asset) return undefined
  const { realtime, realtimePercent, realtimePercentDenominator, averageEntryPrice } = pnlData?.[asset]
  const averageEntryPriceFormatted = formatBig6USDPrice(averageEntryPrice)

  let livePnl = realtime
  let livePnlPercent = realtimePercent
  if (marketSnapshot && livePrices) {
    const {
      global: { latestPrice },
      nextPosition,
    } = marketSnapshot
    const livePrice = livePrices[asset]
    const liveDelta = livePrice ? livePrice - latestPrice : 0n
    const magnitudeForCalc = failedClose ? magnitude : nextMagnitude

    let livePnlDelta = Big6Math.mul(magnitudeForCalc, liveDelta)
    if (side === PositionSide2.maker || nextSide === PositionSide2.maker) {
      const makerExposure = calcMakerExposure(
        magnitudeForCalc,
        nextPosition.maker,
        nextPosition.long,
        nextPosition.short,
      )
      // Maker positions are dampened by exposure
      livePnlDelta = Big6Math.mul(liveDelta, makerExposure)
    } else if (side === PositionSide2.short || nextSide === PositionSide2.short) {
      // Shorts are negative
      livePnlDelta = Big6Math.mul(liveDelta, magnitudeForCalc * -1n)
    }

    livePnl = livePnl + livePnlDelta
    livePnlPercent =
      realtimePercentDenominator > 0n ? Big6Math.abs(Big6Math.div(livePnl, realtimePercentDenominator)) : 0n
  }

  let positionFees = pnlData[asset].positionFees
  // Subtract price impact fees if taker
  if (side !== PositionSide2.maker && nextSide !== PositionSide2.maker)
    positionFees = positionFees - pnlData[asset].priceImpactFees

  const totalFees =
    pnlData[asset].keeperFees + pnlData[asset].interfaceFees + positionFees + pnlData[asset].liquidationFee
  return {
    data: pnlData[asset],
    pnl: realtime,
    unrealized: realtime - (pnlData[asset].accumulatedPnl.value - totalFees),
    pnlPercent: realtimePercent,
    averageEntryPriceFormatted,
    averageEntryPrice,
    liquidation: pnlData[asset].liquidation,
    livePnl,
    livePnlPercent,
    totalFees,
    liveUnrealized: livePnl - (pnlData[asset].accumulatedPnl.value - totalFees),
  }
}

export const useHandleRowClick = () => {
  const {
    setSelectedMarket,
    setOrderDirection,
    setActivePositionTab,
    selectedMarket,
    orderDirection,
    isMaker,
    selectedMakerMarket,
    setSelectedMakerMarket,
  } = useMarketContext()

  return (row: PositionTableData) => {
    setActivePositionTab(PositionsTab.current)
    if (!isMaker) {
      if (row.asset === selectedMarket && row.details.side === orderDirection) return
      setSelectedMarket(row.asset)
      setOrderDirection(row.details.side === PositionSide2.long ? PositionSide2.long : PositionSide2.short)
    } else {
      const { asset } = row.details
      if (asset === selectedMakerMarket) return
      setSelectedMakerMarket(asset)
    }
  }
}
