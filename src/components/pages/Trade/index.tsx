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
import { LivePricesProvider } from '@/contexts/livePriceContext'
import { MarketProvider } from '@/contexts/marketContext'
import { SettlementToastProvider } from '@/contexts/settlementToastContext'
import { TradeFormProvider } from '@/contexts/tradeFormContext'
import { useRefreshKeysOnPriceUpdates2 } from '@/hooks/markets2'
import { usePositionViewManager } from '@/pages/trade'

import Chart from './Chart'
import MarketBar from './MarketBar'
import MobileTradeButtons from './MobileTradeButtons'
import { MobileTradeView } from './MobileTradeView'
import PositionManager from './PositionManager'
import TradeForm from './TradeForm'
import MobileTradeForm from './TradeForm/MobileTradeForm'

export default function Trade() {
  useRefreshKeysOnPriceUpdates2()
  const { positionView } = usePositionViewManager()
  return (
    <MarketProvider>
      <TradeFormProvider>
        <LivePricesProvider>
          <SettlementToastProvider>
            <HeadWithLivePrices />
            <TradeLayout>
              <HeaderGridItem>
                <NavBar />
              </HeaderGridItem>
              {positionView ? (
                <MobileTradeView />
              ) : (
                <>
                  <MarketBarGridItem>
                    <MarketBar />
                  </MarketBarGridItem>
                  <FlexibleGridItem gridArea="tradeForm" desktopOnly>
                    <TradeForm />
                  </FlexibleGridItem>
                  <ChartGridItem>
                    <Chart />
                  </ChartGridItem>
                  <MobileTradeButtons />
                </>
              )}
              <MobileTradeForm />
            </TradeLayout>
          </SettlementToastProvider>
        </LivePricesProvider>
      </TradeFormProvider>
    </MarketProvider>
  )
}
