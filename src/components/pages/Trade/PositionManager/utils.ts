import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { AssetSnapshots, LivePrices, PositionDetails, UserCurrentPositions } from '@/hooks/markets'
import { Big18Math, formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'

import { OrderSide } from '../TradeForm/constants'
import { FormattedPositionDetail, PositionStatus } from './constants'

export const calculatePnl = (positionDetails?: PositionDetails, livePriceDelta?: bigint) => {
  if (!positionDetails) return { pnl: '0', pnlPercentage: '0', isPnlPositive: false }
  let pnl = Big18Math.sub(
    Big18Math.sub(positionDetails?.currentCollateral ?? 0n, positionDetails?.startCollateral ?? 0n),
    positionDetails?.deposits ?? 0n,
  )

  // If there is a new price from offchain sources, update PnL with the difference
  // TODO: This should take into account socialization and/or utilization
  if (livePriceDelta && positionDetails?.nextPosition) {
    const additionalPnl = Big18Math.mul(positionDetails.nextPosition, livePriceDelta)
    pnl = Big18Math.add(pnl, additionalPnl)
  }
  let pnlPercentage = '0'
  if (positionDetails?.startCollateral) {
    pnlPercentage = formatBig18Percent(Big18Math.div(pnl, positionDetails?.startCollateral ?? 0n), {
      numDecimals: 2,
    })
  }
  return {
    pnl: formatBig18USDPrice(pnl),
    pnlPercentage,
    isPnlPositive: pnl > 0n,
  }
}

export const unpackPosition = ({
  positions,
  selectedMarket,
  orderSide,
}: {
  positions?: UserCurrentPositions
  selectedMarket: SupportedAsset
  orderSide: OrderSide
}): { side: OrderSide; details: PositionDetails } | null => {
  if (!positions) return null
  const position = positions[selectedMarket]

  const longCollateral = position?.long?.currentCollateral ?? 0n
  const shortCollateral = position?.short?.currentCollateral ?? 0n

  const hasLongCollateral = !Big18Math.isZero(longCollateral)
  const hasShortCollateral = !Big18Math.isZero(shortCollateral)

  if (!hasLongCollateral && !hasShortCollateral) return null

  let side: OrderSide
  let details: PositionDetails

  if (orderSide === OrderSide.Long) {
    if (hasLongCollateral) {
      side = OrderSide.Long
      details = position?.long as PositionDetails
    } else {
      side = OrderSide.Short
      details = position?.short as PositionDetails
    }
  } else {
    if (hasShortCollateral) {
      side = OrderSide.Short
      details = position?.short as PositionDetails
    } else {
      side = OrderSide.Long
      details = position?.long as PositionDetails
    }
  }

  return { side, details }
}

export const getPositionStatus = (positionDetails?: PositionDetails) => {
  if (!positionDetails) {
    return PositionStatus.resolved
  }
  const nextPosition = positionDetails?.nextPosition ?? 0n
  const position = positionDetails?.position ?? 0n
  const currentCollateral = positionDetails?.currentCollateral ?? 0n

  if (Big18Math.isZero(nextPosition) && !Big18Math.isZero(position)) {
    return PositionStatus.closing
  }
  if (Big18Math.isZero(nextPosition) && Big18Math.isZero(position) && !Big18Math.isZero(currentCollateral)) {
    return PositionStatus.closed
  }
  if (!Big18Math.isZero(nextPosition) && Big18Math.isZero(position)) {
    return PositionStatus.opening
  }
  if (!Big18Math.isZero(nextPosition) && !Big18Math.isZero(position) && !Big18Math.eq(nextPosition, position)) {
    return PositionStatus.pricing
  }
  if (!Big18Math.isZero(nextPosition) && !Big18Math.isZero(position)) {
    return PositionStatus.open
  }
  return PositionStatus.resolved
}

export const transformPositionDataToArray = (userPositions?: UserCurrentPositions) => {
  const result: FormattedPositionDetail[] = []
  if (!userPositions) return result
  for (const [_asset, positionData] of Object.entries(userPositions)) {
    const asset = _asset as SupportedAsset
    const symbol = AssetMetadata[asset].symbol
    if (positionData) {
      if (positionData?.long && positionData?.long?.currentCollateral !== 0n) {
        result.push({ asset, symbol, details: positionData?.long, side: OrderSide.Long })
      }
      if (positionData?.short && positionData?.short?.currentCollateral !== 0n) {
        result.push({ asset, symbol, details: positionData?.short, side: OrderSide.Short })
      }
    }
  }
  return result
}

export const getCurrentPriceDelta = ({
  snapshots,
  asset,
  livePrices,
}: {
  snapshots?: AssetSnapshots
  asset: SupportedAsset
  livePrices: LivePrices
}) => {
  if (!snapshots) return undefined
  const selectedMarketSnapshot = snapshots[asset]
  const currentPrice = Big18Math.abs(
    selectedMarketSnapshot?.long?.latestVersion?.price ?? selectedMarketSnapshot?.short?.latestVersion?.price ?? 0n,
  )
  const pythPrice = livePrices[asset]
  // Use the live price to calculate real time pnl
  const currentPriceDelta = currentPrice > 0 && pythPrice ? pythPrice - currentPrice : undefined
  return currentPriceDelta
}

export const getFormattedPositionDetails = ({
  positionDetails,
  numSigFigs,
  placeholderString,
}: {
  positionDetails?: PositionDetails
  numSigFigs: number
  placeholderString: string
}) => ({
  currentCollateral: positionDetails ? formatBig18USDPrice(positionDetails?.currentCollateral) : placeholderString,
  startCollateral: positionDetails ? formatBig18USDPrice(positionDetails?.startCollateral) : placeholderString,
  position: positionDetails ? formatBig18(positionDetails?.position, { numSigFigs }) : placeholderString,
  nextPosition: positionDetails ? formatBig18(positionDetails?.nextPosition, { numSigFigs }) : placeholderString,
  averageEntry: positionDetails ? formatBig18USDPrice(positionDetails?.averageEntry) : placeholderString,
  liquidationPrice: positionDetails ? formatBig18USDPrice(positionDetails?.liquidationPrice) : placeholderString,
  notional: positionDetails ? formatBig18USDPrice(positionDetails?.notional) : placeholderString,
  leverage: positionDetails ? formatBig18(positionDetails?.leverage) : placeholderString,
})
