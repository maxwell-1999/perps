import { SupportedAsset } from '@/constants/assets'
import { PositionDetails, UserCurrentPositions } from '@/hooks/markets'
import { Big18Math, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'

import { OrderSide } from '../TradeForm/constants'
import { PositionStatus } from './constants'

export const calculatePnl = (positionDetails: PositionDetails, livePriceDelta?: bigint) => {
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

export const getPositionStatus = (position?: PositionDetails) => {
  if (!position) {
    return PositionStatus.resolved
  }
  const isClosing = Big18Math.isZero(position?.nextPosition ?? 0n) && !Big18Math.isZero(position?.position ?? 0n)
  if (isClosing) {
    return PositionStatus.closing
  }
  const isClosed =
    Big18Math.isZero(position?.nextPosition ?? 0n) &&
    Big18Math.isZero(position?.position ?? 0n) &&
    !Big18Math.isZero(position?.currentCollateral ?? 0n)
  if (isClosed) {
    return PositionStatus.closed
  }
  const isOpening = !Big18Math.isZero(position?.nextPosition ?? 0n) && Big18Math.isZero(position?.position ?? 0n)
  if (isOpening) {
    return PositionStatus.opening
  }
  const isPricing =
    !Big18Math.isZero(position?.nextPosition ?? 0n) &&
    !Big18Math.isZero(position?.position ?? 0n) &&
    !Big18Math.eq(position?.nextPosition ?? 0n, position?.position ?? 0n)
  if (isPricing) {
    return PositionStatus.pricing
  }
  const isOpen = !Big18Math.isZero(position?.nextPosition ?? 0n) && !Big18Math.isZero(position?.position ?? 0n)
  if (isOpen) {
    return PositionStatus.open
  }
  return PositionStatus.resolved
}
