import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { useMarketContext } from '@/contexts/marketContext'
import { PositionDetails, useChainAssetSnapshots, useChainLivePrices, useUserCurrentPositions } from '@/hooks/markets'
import { formatBig18Percent } from '@/utils/big18Utils'
import { Day } from '@/utils/timeUtils'

import { OrderSide } from '../TradeForm/constants'
import {
  calculatePnl,
  getCurrentPriceDelta,
  getFormattedPositionDetails,
  getPositionStatus,
  transformPositionDataToArray,
  unpackPosition,
} from './utils'

export const useStyles = () => {
  const theme = useTheme()
  const borderColor = useColorModeValue(theme.colors.brand.blackAlpha[10], theme.colors.brand.whiteAlpha[10])
  const subheaderTextColor = useColorModeValue(theme.colors.brand.blackAlpha[50], theme.colors.brand.whiteAlpha[50])
  const alpha75 = useColorModeValue(theme.colors.brand.blackAlpha[75], theme.colors.brand.whiteAlpha[75])
  const alpha90 = useColorModeValue(theme.colors.brand.blackAlpha[90], theme.colors.brand.whiteAlpha[90])
  const green = theme.colors.brand.green
  const red = theme.colors.brand.red
  return { borderColor, green, red, subheaderTextColor, alpha75, alpha90 }
}

export const usePositionManagerCopy = () => {
  const intl = useIntl()
  return {
    thisPosition: intl.formatMessage({ defaultMessage: 'This Position' }),
    allPositions: intl.formatMessage({ defaultMessage: 'All Positions' }),
    history: intl.formatMessage({ defaultMessage: 'History' }),
    open: intl.formatMessage({ defaultMessage: 'Open' }),
    closed: intl.formatMessage({ defaultMessage: 'Closed' }),
    opening: intl.formatMessage({ defaultMessage: 'Opening...' }),
    closing: intl.formatMessage({ defaultMessage: 'Closing...' }),
    pricing: intl.formatMessage({ defaultMessage: 'Pricing...' }),
    resolved: intl.formatMessage({ defaultMessage: 'Resolved' }),
    long: intl.formatMessage({ defaultMessage: 'Long' }),
    short: intl.formatMessage({ defaultMessage: 'Short' }),
    size: intl.formatMessage({ defaultMessage: 'Size' }),
    pnl: intl.formatMessage({ defaultMessage: 'P&L' }),
    liquidationPrice: intl.formatMessage({ defaultMessage: 'Liquidation price' }),
    yourAverageEntry: intl.formatMessage({ defaultMessage: 'Your average entry' }),
    dailyFundingRate: intl.formatMessage({ defaultMessage: 'Daily funding rate' }),
    collateral: intl.formatMessage({ defaultMessage: 'Collateral' }),
    sharePosition: intl.formatMessage({ defaultMessage: 'Share position' }),
    modify: intl.formatMessage({ defaultMessage: 'Modify' }),
    close: intl.formatMessage({ defaultMessage: 'Close' }),
    x: intl.formatMessage({ defaultMessage: 'x' }),
    noValue: intl.formatMessage({ defaultMessage: '--' }),
    side: intl.formatMessage({ defaultMessage: 'Side' }),
    withdraw: intl.formatMessage({ defaultMessage: 'Withdraw collateral' }),
    market: intl.formatMessage({ defaultMessage: 'Market' }),
    liquidation: intl.formatMessage({ defaultMessage: 'Liquidation' }),
  }
}

export const useFormatPosition = () => {
  const { assetMetadata, selectedMarket, orderSide } = useMarketContext()
  const { data: snapshots } = useChainAssetSnapshots()
  const { data: positions } = useUserCurrentPositions()
  const { noValue, long, short } = usePositionManagerCopy()
  const position = unpackPosition({ positions, selectedMarket, orderSide })
  const positionStatus = getPositionStatus(position?.details)
  const numSigFigs = assetMetadata.displayDecimals
  const selectedMarketSnapshot = snapshots?.[selectedMarket]

  const fundingRate =
    position?.side === OrderSide.Long ? selectedMarketSnapshot?.long?.rate : selectedMarketSnapshot?.short?.rate

  return {
    positionDetails: position?.details,
    status: positionStatus,
    side: position ? (position.side === OrderSide.Long ? long : short) : noValue,
    dailyFunding: position ? formatBig18Percent((fundingRate ?? 0n) * Day, { numDecimals: 4 }) : noValue,
    ...getFormattedPositionDetails({ positionDetails: position?.details, placeholderString: noValue, numSigFigs }),
  }
}

export const useOpenPositionTableData = () => {
  const { data: positionData } = useUserCurrentPositions()
  const { noValue } = usePositionManagerCopy()
  const positions = transformPositionDataToArray(positionData)

  return positions.map((position) => {
    const numSigFigs = AssetMetadata[position.asset]?.displayDecimals ?? 2

    return {
      details: position.details,
      side: position.side,
      asset: position.asset,
      symbol: position.symbol,
      ...getFormattedPositionDetails({ positionDetails: position.details, placeholderString: noValue, numSigFigs }),
    }
  })
}

export const usePnl = ({ asset, positionDetails }: { asset: SupportedAsset; positionDetails: PositionDetails }) => {
  const livePrices = useChainLivePrices()
  const { data: snapshots } = useChainAssetSnapshots()
  const currentPriceDelta = getCurrentPriceDelta({ snapshots, livePrices, asset: asset })
  const { pnl, pnlPercentage, isPnlPositive } = calculatePnl(positionDetails, currentPriceDelta)
  return { pnl, pnlPercentage, isPnlPositive }
}
