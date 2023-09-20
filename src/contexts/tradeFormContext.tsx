import { createContext, useContext, useEffect, useState } from 'react'

import { useMarketContext } from './marketContext'

export enum FormState {
  trade = 'trade',
  close = 'close',
  modify = 'modify',
  withdraw = 'withdraw',
  add = 'add',
}

const TradeFormOverlayContext = createContext({
  formState: FormState.trade,
  setTradeFormState: (state: FormState) => {
    state
  },
})

export const TradeFormProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    selectedMarketSnapshot,
    orderDirection,
    selectedMakerMarketSnapshot,
    selectedMakerMarket,
    selectedMarket,
    isMaker,
  } = useMarketContext()
  const isCloseOnly = isMaker
    ? selectedMakerMarketSnapshot?.closed ?? false
    : selectedMarketSnapshot?.[orderDirection]?.closed ?? false
  const [formState, _setTradeFormState] = useState(FormState.trade)

  useEffect(() => {
    if (isCloseOnly) {
      _setTradeFormState(FormState.close)
    }
  }, [isCloseOnly, selectedMarket, selectedMakerMarket])

  const setTradeFormState = (state: FormState) => {
    const closeOnlyStates = [FormState.withdraw, FormState.close]
    if (isCloseOnly && !closeOnlyStates.includes(state)) {
      _setTradeFormState(FormState.close)
      return
    }
    _setTradeFormState(state)
  }

  return (
    <TradeFormOverlayContext.Provider value={{ formState, setTradeFormState }}>
      {children}
    </TradeFormOverlayContext.Provider>
  )
}

export const useTradeFormState = () => {
  const context = useContext(TradeFormOverlayContext)
  if (context === undefined) {
    throw new Error('useTradeFormState must be used within a TradeFormProvider')
  }
  return context
}
