import { createContext, useContext } from 'react'

import { UserCurrentPositions, useUserCurrentPositions } from '@/hooks/markets'

type PositionContextType = {
  positions?: UserCurrentPositions
}

const PositionContext = createContext<PositionContextType>({
  positions: undefined,
})

export const PositionProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: positions } = useUserCurrentPositions()

  return (
    <PositionContext.Provider
      value={{
        positions,
      }}
    >
      {children}
    </PositionContext.Provider>
  )
}

export const usePositionContext = () => {
  const context = useContext(PositionContext)
  if (!context) {
    throw new Error('usePositionContext must be used within a PositionProvider')
  }
  return context
}
