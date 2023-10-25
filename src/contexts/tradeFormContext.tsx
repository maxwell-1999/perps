import { useBreakpointValue } from '@chakra-ui/react'
import { createContext, useContext, useEffect, useState } from 'react'

export enum FormState {
  trade = 'trade',
  close = 'close',
  modify = 'modify',
  withdraw = 'withdraw',
  add = 'add',
  error = 'error',
}

const TradeFormOverlayContext = createContext({
  formState: FormState.trade,
  setTradeFormState: (state: FormState) => {
    state
  },
  mobileTradeFormOpen: false,
  setMobileTradeFormOpen: (state: boolean) => {
    state
  },
})

export const TradeFormProvider = ({ children }: { children: React.ReactNode }) => {
  const [formState, _setTradeFormState] = useState(FormState.trade)
  const [mobileTradeFormOpen, _setmobileTradeFormOpen] = useState(false)
  const isBase = useBreakpointValue({ base: true, sm: false })

  useEffect(() => {
    if (!isBase) {
      _setmobileTradeFormOpen(false)
    }
  }, [isBase])

  const setTradeFormState = (state: FormState) => {
    _setTradeFormState(state)
  }

  const setMobileTradeFormOpen = (state: boolean) => {
    _setmobileTradeFormOpen(state)
  }

  return (
    <TradeFormOverlayContext.Provider
      value={{ formState, setTradeFormState, setMobileTradeFormOpen, mobileTradeFormOpen }}
    >
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
