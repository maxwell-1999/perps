import { SupportedAsset } from '@/constants/assets'
import { PositionDetails } from '@/hooks/markets'

export type FormattedPositionDetail = {
  asset: SupportedAsset
  symbol: string
  details: PositionDetails
}

export type PositionTableData = {
  asset: SupportedAsset
  averageEntry: string
  currentCollateral: string
  leverage: string
  nextLeverage: string
  liquidationPrice: string
  nextPosition: string
  notional: string
  nextNotional: string
  position: string
  startCollateral: string
  symbol: string
  fees: string
  details: PositionDetails
  unformattedNotional: string
  unformattedLiquidationPrice: string
}
