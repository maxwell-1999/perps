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
}: {
  positions?: UserCurrentPositions
  selectedMarket: SupportedAsset
}): { side: OrderSide; details: PositionDetails } | null => {
  if (!positions) return null
  const position = positions[selectedMarket]
  const isShort = !Big18Math.isZero(position?.long?.currentCollateral ?? 0n)
  const isLong = !Big18Math.isZero(position?.long?.currentCollateral ?? 0n)
  if (!isShort && !isLong) return null
  return {
    side: isLong ? OrderSide.Long : OrderSide.Short,
    details: isLong ? (position?.long as PositionDetails) : (position?.short as PositionDetails),
  }
}
