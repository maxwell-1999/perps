import { SupportedAsset } from '@/constants/assets'
import { PositionDetails, UserCurrentPositions } from '@/hooks/markets'
import { Big18Math, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'

import { OrderSide } from '../TradeForm/constants'

export const calculatePnl = (positionDetails: PositionDetails) => {
  const pnl = Big18Math.sub(positionDetails?.currentCollateral ?? 0n, positionDetails?.startCollateral ?? 0n)
  const pnlPercentage = formatBig18Percent(Big18Math.div(pnl, positionDetails?.startCollateral ?? 0n), {
    numDecimals: 2,
  })
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
