import { SupportedAsset } from '@/constants/assets'
import { PositionDetails } from '@/hooks/markets'

import { OrderSide } from '../TradeForm/constants'

export enum PositionStatus {
  open = 'open',
  closed = 'closed',
  opening = 'opening',
  closing = 'closing',
  pricing = 'pricing',
  resolved = 'noValue',
}

export type FormattedPositionDetail = {
  asset: SupportedAsset
  symbol: string
  side: OrderSide
  details: PositionDetails
}

export type OpenPositionTableData = {
  asset: SupportedAsset
  side: OrderSide
  averageEntry: string
  currentCollateral: string
  leverage: string
  liquidationPrice: string
  nextPosition: string
  notional: string
  position: string
  startCollateral: string
  symbol: string
  details: PositionDetails
  unformattedNotional: string
  unformattedLiquidationPrice: string
}
