import { SupportedAsset } from '@/constants/markets'
import { UserMarketSnapshot } from '@/hooks/markets2'

export type FormattedPositionDetail = {
  asset: SupportedAsset
  symbol: string
  details: UserMarketSnapshot
}

export type PositionTableData = {
  asset: SupportedAsset
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
  liquidationFee: string
  details: UserMarketSnapshot
  unformattedNotional: string
  unformattedLiquidationPrice: string
  makerExposure?: string
  exposureSide?: string
  isClosed: boolean
  isClosing: boolean
  failedClose: boolean
}
