import { SupportedAsset } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'

export enum TrackingEvents {
  pageview = 'Page View',
  trade = 'Trade',
  withdrawCollateral = 'Withdraw Collateral',
}

interface PageViewEvent {
  url: string
}

interface TradeEvent {
  asset: SupportedAsset
  amount: string
  leverage: string
  collateral: string
  orderDirection: OrderDirection
  orderType: string
  orderAction: string
}

interface WithdrawEvent {
  asset: SupportedAsset
  collateral: string
}

export type EventMap = {
  [TrackingEvents.pageview]: PageViewEvent
  [TrackingEvents.trade]: TradeEvent
  [TrackingEvents.withdrawCollateral]: WithdrawEvent
}
