import {
  ChartGridItem,
  HeaderGridItem,
  MarketBarGridItem,
  PositionManagerGridItem,
  TradeFormGridItem,
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

export default function Make() {
  return (
    <MarketProvider isMaker>
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
            <TradeFormGridItem>
              <TradeForm />
            </TradeFormGridItem>
            <ChartGridItem>
              <Chart />
            </ChartGridItem>
            <PositionManagerGridItem>
              <PositionManager />
            </PositionManagerGridItem>
          </TradeLayout>
        </SettlementToastProvider>
      </TradeFormProvider>
    </MarketProvider>
  )
}
