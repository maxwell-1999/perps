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
  goToV1 = 'Go to V1',
  redeemV1VaultShares = 'Redeem V1 Vault Shares',
  claimV1VaultRewards = 'Claim V1 Vault Shares',
  initiateV1ToV2VaultDeposit = 'Initiate V1 to V2 Vault Deposit',
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
  [TrackingEvents.goToV1]: any
  [TrackingEvents.redeemV1VaultShares]: VaultEvent
  [TrackingEvents.claimV1VaultRewards]: VaultEvent
  [TrackingEvents.initiateV1ToV2VaultDeposit]: VaultEvent
}
