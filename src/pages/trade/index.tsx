import { createContext, useCallback, useContext, useState } from 'react'

import Trade from '@/components/pages/Trade'

const PositionContext = createContext(null)
export default function TradePage() {
  const [postionView, setPostionView] = useState(false)
  return (
    <PositionContext.Provider value={[postionView, setPostionView]}>
      <Trade />
    </PositionContext.Provider>
  )
}
export const usePositionViewManager = () => {
  const [positionView, setPositionView] = useContext(PositionContext)
  const openPositionView = useCallback(() => {
    setPositionView(true)
  }, [setPositionView])
  const closePositonView = useCallback(() => {
    setPositionView(false)
  }, [setPositionView])
  return {
    positionView,
    openPositionView,
    closePositonView,
  }
}
