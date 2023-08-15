import { createContext, useContext, useState } from 'react'

import { DefaultChain } from '@/constants/network'

const ChainContext = createContext({
  defaultChain: DefaultChain,
  setDefaultChain: (chain: typeof DefaultChain) => {
    chain
  },
})

export const ChainProvider = ({ children }: { children: React.ReactNode }) => {
  const [defaultChain, setDefaultChain] = useState(DefaultChain)

  return <ChainContext.Provider value={{ defaultChain, setDefaultChain }}>{children}</ChainContext.Provider>
}

export const useDefaultChain = () => {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('useDefaultChain must be used within a ChainProvider')
  }
  return context
}
