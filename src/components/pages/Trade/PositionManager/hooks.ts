import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { AssetMetadata } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import {
  PositionDetails,
  useChainAssetSnapshots,
  useChainLivePrices,
  useUserChainPositionHistory,
  useUserCurrentPositions,
} from '@/hooks/markets'
import { notEmpty } from '@/utils/arrayUtils'
import { Big18Math, formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'
import { socialization, utilization } from '@/utils/positionUtils'
import { Day } from '@/utils/timeUtils'

import { PositionSide } from '@t/gql/graphql'

import { calculatePnl, getCurrentPriceDelta, getFormattedPositionDetails, transformPositionDataToArray } from './utils'

export const useStyles = () => {
  const theme = useTheme()
  const borderColor = useColorModeValue(theme.colors.brand.blackAlpha[10], theme.colors.brand.whiteAlpha[10])
  const subheaderTextColor = useColorModeValue(theme.colors.brand.blackAlpha[50], theme.colors.brand.whiteAlpha[50])
  const alpha75 = useColorModeValue(theme.colors.brand.blackAlpha[75], theme.colors.brand.whiteAlpha[75])
  const alpha90 = useColorModeValue(theme.colors.brand.blackAlpha[90], theme.colors.brand.whiteAlpha[90])
  const alpha5 = useColorModeValue(theme.colors.brand.blackAlpha[5], theme.colors.brand.whiteAlpha[5])
  // TODO: light color theme background
  const background = useColorModeValue(theme.colors.brand.blackSolid[5], theme.colors.brand.blackSolid[5])
  const green = theme.colors.brand.green
  const red = theme.colors.brand.red
  return { borderColor, green, red, subheaderTextColor, alpha75, alpha90, alpha5, background }
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
    long: intl.formatMessage({ defaultMessage: 'Long' }),
    short: intl.formatMessage({ defaultMessage: 'Short' }),
    size: intl.formatMessage({ defaultMessage: 'Size' }),
    pnl: intl.formatMessage({ defaultMessage: 'P&L' }),
    liquidationPrice: intl.formatMessage({ defaultMessage: 'Liquidation Price' }),
    averageEntry: intl.formatMessage({ defaultMessage: 'Average Entry' }),
    dailyFundingRate: intl.formatMessage({ defaultMessage: 'Daily Funding Rate' }),
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
  }
}

export const useFormatPosition = () => {
  const { assetMetadata, selectedMarket, orderDirection, selectedMarketSnapshot } = useMarketContext()
  const { data: positions } = useUserCurrentPositions()
  const { noValue, long, short } = usePositionManagerCopy()
  const position = positions?.[selectedMarket]?.[orderDirection]
  const numSigFigs = assetMetadata.displayDecimals

  const fundingRate =
    position?.direction === OrderDirection.Long
      ? selectedMarketSnapshot?.Long?.rate
      : selectedMarketSnapshot?.Short?.rate

  return {
    positionDetails: position,
    formattedValues: {
      direction: position ? (position.direction === OrderDirection.Long ? long : short) : noValue,
      dailyFunding: position ? formatBig18Percent((fundingRate ?? 0n) * Day, { numDecimals: 4 }) : noValue,
      ...getFormattedPositionDetails({ positionDetails: position, placeholderString: noValue, numSigFigs }),
    },
  }
}

export const useOpenPositionTableData = () => {
  const { data: positionData } = useUserCurrentPositions()
  const { noValue } = usePositionManagerCopy()
  const positions = transformPositionDataToArray(positionData)

  return positions
    .map((position) => {
      const numSigFigs = AssetMetadata[position.asset]?.displayDecimals ?? 2

      return {
        details: position.details,
        asset: position.asset,
        symbol: position.symbol,
        ...getFormattedPositionDetails({ positionDetails: position.details, placeholderString: noValue, numSigFigs }),
      }
    })
    .sort((a, b) => Big18Math.cmp(b.details?.nextNotional ?? 0n, a.details?.nextNotional ?? 0n))
}

export const usePositionHistoryTableData = () => {
  const { noValue } = usePositionManagerCopy()
  const {
    data: positionHistory,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
  } = useUserChainPositionHistory(PositionSide.Taker)

  const positions = (positionHistory?.pages.flatMap((page) => page?.positions).filter(notEmpty) ?? []).map(
    (position) => {
      const numSigFigs = AssetMetadata[position.asset]?.displayDecimals ?? 2
      const symbol = AssetMetadata[position.asset]?.symbol ?? position.asset

      const startingPosition = position.subPositions
        ? position.subPositions[0].size + position.subPositions[0].delta
        : 0n
      return {
        details: position,
        asset: position.asset,
        symbol: symbol,
        ...getFormattedPositionDetails({ positionDetails: position, placeholderString: noValue, numSigFigs }),
        position: position.subPositions ? formatBig18(startingPosition) : noValue,
        notional: position.subPositions
          ? formatBig18USDPrice(Big18Math.mul(startingPosition, position.subPositions[0].settlePrice))
          : noValue,
      }
    },
  )
  return {
    positions,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
  }
}

export const usePnl = ({ positionDetails, live }: { positionDetails: PositionDetails; live?: boolean }) => {
  const livePrices = useChainLivePrices()
  const { data: snapshots } = useChainAssetSnapshots()
  const { asset } = positionDetails

  if (!live) return calculatePnl(positionDetails)
  const productSnapshot = positionDetails?.direction ? snapshots?.[asset]?.[positionDetails.direction] : undefined
  let currentPriceDelta = getCurrentPriceDelta({ snapshots, livePrices, asset: asset })

  // Multiply the live price by the payoff direction of the market
  let payoffDirectionMultiplier = 1n
  if (productSnapshot) {
    payoffDirectionMultiplier = productSnapshot.productInfo.payoffDefinition.payoffDirection === 0n ? 1n : -1n
    // Makers take the opposite side of the payoff
    if (positionDetails.side === 'maker') payoffDirectionMultiplier = payoffDirectionMultiplier * -1n
  }

  // If taker, apply socialization dampening
  if (productSnapshot && positionDetails.side === 'taker' && currentPriceDelta)
    currentPriceDelta =
      Big18Math.mul(currentPriceDelta, socialization(productSnapshot.pre, productSnapshot.position)) *
      payoffDirectionMultiplier
  // If maker, apply utilization dampening
  else if (productSnapshot && positionDetails.side === 'maker' && currentPriceDelta)
    currentPriceDelta =
      Big18Math.mul(currentPriceDelta, utilization(productSnapshot.pre, productSnapshot.position)) *
      payoffDirectionMultiplier

  return calculatePnl(positionDetails, currentPriceDelta)
}
