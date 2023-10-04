import { PositionSide2, SupportedAsset } from '@/constants/markets'

export enum TrackingEvents {
  pageview = 'Page View',
  trade = 'Trade',
  make = 'make',
  withdrawCollateral = 'Withdraw Collateral',
  changeChart = 'Toggle chart type',
  selectMarket = 'Select Market',
  selectMakerMarket = 'Select Maker Market',
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
  orderDirection: PositionSide2
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

interface SelectMakerMarketEvent {
  makerMarket: string
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
  [TrackingEvents.make]: TradeEvent
  [TrackingEvents.withdrawCollateral]: WithdrawEvent
  [TrackingEvents.changeChart]: ChangeChartEvent
  [TrackingEvents.selectMarket]: SelectMarketEvent
  [TrackingEvents.changePositionManager]: ChangePositionManagerEvent
  [TrackingEvents.depositToVault]: VaultEvent
  [TrackingEvents.redeemFromVault]: VaultEvent
  [TrackingEvents.withdrawFromVault]: VaultEvent
  [TrackingEvents.selectMakerMarket]: SelectMakerMarketEvent
}
