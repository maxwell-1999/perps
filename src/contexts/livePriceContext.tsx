import { createContext, useContext } from 'react'

import { LivePrices, useChainLivePrices2 } from '@/hooks/markets2'

const initialPrices: LivePrices = {
  btc: undefined,
  eth: undefined,
  arb: undefined,
  link: undefined,
  msqth: undefined,
  sol: undefined,
  matic: undefined,
}

const LivePricesContext = createContext(initialPrices)

export const LivePricesProvider = ({ children }: { children: React.ReactNode }) => {
  const prices = useChainLivePrices2()

  return <LivePricesContext.Provider value={prices}>{children}</LivePricesContext.Provider>
}

export const useLivePriceContext = () => {
  const context = useContext(LivePricesContext)
  if (!context) {
    throw new Error('useLivePrices must be used within a LivePricesProvider')
  }
  return context
}
