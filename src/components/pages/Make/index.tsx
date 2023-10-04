import { useEffect, useState } from 'react'

import {
  ChartGridItem,
  FlexibleGridItem,
  HeaderGridItem,
  MarketBarGridItem,
  MobileTradeButtonsGridItem,
  PositionManagerGridItem,
  TradeLayout,
} from '@/components/layout/TradeLayout'
import Chart from '@/components/pages/Trade/Chart'
import MarketBar from '@/components/pages/Trade/MarketBar'
import PositionManager from '@/components/pages/Trade/PositionManager'
import TradeForm from '@/components/pages/Trade/TradeForm'
import { HeadWithLivePrices } from '@/components/shared/Head'
import NavBar from '@/components/shared/NavBar'
import { MarketProvider } from '@/contexts/marketContext'
import { SettlementToastProvider } from '@/contexts/settlementToastContext'
import { TradeFormProvider } from '@/contexts/tradeFormContext'
import { useRefreshKeysOnPriceUpdates2 } from '@/hooks/markets2'

import MobileTradeButtons from '../Trade/MobileTradeButtons'
import MobileTradeForm from '../Trade/TradeForm/MobileTradeForm'
import MakerWarningModal from './MakerWarningModal'

export default function Make() {
  useRefreshKeysOnPriceUpdates2()
  const [hasSeenModal, setHasSeenModal] = useState(true)

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('maker-warning-modal')
    if (!hasSeenModal) {
      setHasSeenModal(false)
    }
  }, [])

  return (
    <>
      <MarketProvider isMaker>
        <TradeFormProvider>
          <SettlementToastProvider>
            <HeadWithLivePrices />
            <TradeLayout isMaker>
              <HeaderGridItem>
                <NavBar />
              </HeaderGridItem>
              <MarketBarGridItem>
                <MarketBar />
              </MarketBarGridItem>
              <FlexibleGridItem gridArea="tradeForm" desktopOnly>
                <TradeForm />
              </FlexibleGridItem>
              <ChartGridItem>
                <Chart />
              </ChartGridItem>
              <PositionManagerGridItem>
                <PositionManager />
              </PositionManagerGridItem>
              <MobileTradeButtonsGridItem>
                <MobileTradeButtons isMaker />
              </MobileTradeButtonsGridItem>
              <MobileTradeForm />
            </TradeLayout>
          </SettlementToastProvider>
        </TradeFormProvider>
      </MarketProvider>
      {!hasSeenModal && <MakerWarningModal onClose={() => setHasSeenModal(true)} />}
    </>
  )
}
