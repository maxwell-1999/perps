import { SupportedAsset } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'

export enum TrackingEvents {
  pageview = 'Page View',
  trade = 'Trade',
  withdrawCollateral = 'Withdraw Collateral',
  changeChart = 'Toggle chart type',
  selectMarket = 'Select Market',
  changePositionManager = 'Change Position Manager Tab',
  depositToVault = 'Deposit to Vault',
  redeemFromVault = 'Redeem from Vault',
  withdrawFromVault = 'Withdraw from Vault',
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

interface ChangeChartEvent {
  chartType: string
}

interface SelectMarketEvent {
  market: string
}

interface ChangePositionManagerEvent {
  selectedTab: string
}

interface VaultEvent {
  amount: string
  vaultName: string
}

export type EventMap = {
  [TrackingEvents.pageview]: PageViewEvent
  [TrackingEvents.trade]: TradeEvent
  [TrackingEvents.withdrawCollateral]: WithdrawEvent
  [TrackingEvents.changeChart]: ChangeChartEvent
  [TrackingEvents.selectMarket]: SelectMarketEvent
  [TrackingEvents.changePositionManager]: ChangePositionManagerEvent
  [TrackingEvents.depositToVault]: VaultEvent
  [TrackingEvents.redeemFromVault]: VaultEvent
  [TrackingEvents.withdrawFromVault]: VaultEvent
}
