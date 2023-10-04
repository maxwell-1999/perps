import {
  ChartGridItem,
  FlexibleGridItem,
  HeaderGridItem,
  MarketBarGridItem,
  MobileTradeButtonsGridItem,
  PositionManagerGridItem,
  TradeLayout,
} from '@/components/layout/TradeLayout'
import { HeadWithLivePrices } from '@/components/shared/Head'
import NavBar from '@/components/shared/NavBar'
import { MarketProvider } from '@/contexts/marketContext'
import { SettlementToastProvider } from '@/contexts/settlementToastContext'
import { TradeFormProvider } from '@/contexts/tradeFormContext'
import { useRefreshKeysOnPriceUpdates2 } from '@/hooks/markets2'

import Chart from './Chart'
import MarketBar from './MarketBar'
import MobileTradeButtons from './MobileTradeButtons'
import PositionManager from './PositionManager'
import TradeForm from './TradeForm'
import MobileTradeForm from './TradeForm/MobileTradeForm'

export default function Trade() {
  useRefreshKeysOnPriceUpdates2()
  return (
    <MarketProvider>
      <TradeFormProvider>
        <SettlementToastProvider>
          <HeadWithLivePrices />
          <TradeLayout>
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
              <MobileTradeButtons />
            </MobileTradeButtonsGridItem>
            <MobileTradeForm />
          </TradeLayout>
        </SettlementToastProvider>
      </TradeFormProvider>
    </MarketProvider>
  )
}
