import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { useMarketContext } from '@/contexts/marketContext'
import { useChainLivePrices } from '@/hooks/markets'
import { Big18Math, formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'
import { Day } from '@/utils/timeUtils'

import { OrderSide } from '../TradeForm/constants'
import { calculatePnl, unpackPosition } from './utils'

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
    status: intl.formatMessage({ defaultMessage: 'Status:' }),
    side: intl.formatMessage({ defaultMessage: 'Side' }),
  }
}

export const useFormatPosition = () => {
  const { assetMetadata, positions, selectedMarket, orderSide, selectedMarketSnapshot } = useMarketContext()
  const { noValue, long, short } = usePositionManagerCopy()
  const livePrices = useChainLivePrices()
  const position = unpackPosition({ positions, selectedMarket, orderSide })

  const numSigFigs = assetMetadata.displayDecimals

  const currentPrice = Big18Math.abs(
    selectedMarketSnapshot?.long?.latestVersion.price ?? selectedMarketSnapshot?.short?.latestVersion.price ?? 0n,
  )
  const pythPrice = livePrices[selectedMarket]
  // Use the live price to calculate real time pnl
  const currentPriceDelta = currentPrice > 0 && pythPrice ? pythPrice - currentPrice : undefined
  const positionPnl = position?.details
    ? calculatePnl(position?.details, currentPriceDelta)
    : { pnl: 0n, pnlPercentage: 0n, isPnlPositive: true }
  const fundingRate =
    position?.side === OrderSide.Long ? selectedMarketSnapshot?.long?.rate : selectedMarketSnapshot?.short?.rate

  return {
    side: position ? (position.side === OrderSide.Long ? long : short) : noValue,
    currentCollateral: position ? formatBig18USDPrice(position?.details?.currentCollateral) : noValue,
    startCollateral: position ? formatBig18USDPrice(position?.details?.startCollateral) : noValue,
    position: position ? formatBig18(position?.details?.position, { numSigFigs }) : noValue,
    nextPosition: position ? formatBig18(position?.details?.nextPosition, { numSigFigs }) : noValue,
    averageEntry: position ? formatBig18USDPrice(position?.details?.averageEntry) : noValue,
    liquidationPrice: position ? formatBig18USDPrice(position?.details?.liquidationPrice) : noValue,
    notional: position ? formatBig18USDPrice(position?.details?.notional) : noValue,
    leverage: position ? formatBig18(position?.details?.leverage) : noValue,
    pnl: position ? (positionPnl.pnl as string) : noValue,
    pnlPercentage: position ? (positionPnl.pnlPercentage as string) : noValue,
    isPnlPositive: positionPnl.isPnlPositive,
    dailyFunding: position ? formatBig18Percent((fundingRate ?? 0n) * Day, { numDecimals: 4 }) : noValue,
  }
}
