import { useRefreshKeysOnPriceUpdates2 } from '../markets2'

const RefreshKeys = ['vaultSnapshots2', 'vaultPositionHistory']
export const useRefreshVaultsOnPriceUpdates = () => {
  useRefreshKeysOnPriceUpdates2(RefreshKeys)
}

export * from './chain'
export * from './graph'
export * from './tx'
