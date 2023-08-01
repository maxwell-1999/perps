import {
  ChartGridItem,
  HeaderGridItem,
  MarketBarGridItem,
  PositionManagerGridItem,
  TradeFormGridItem,
  TradeLayout,
} from '@/components/layout/TradeLayout'
import { HeadWithLivePrices } from '@/components/shared/Head'
import NavBar from '@/components/shared/NavBar'
import { MarketProvider } from '@/contexts/marketContext'
import { SettlementToastProvider } from '@/contexts/settlementToastContext'
import { TradeFormProvider } from '@/contexts/tradeFormContext'

import Chart from './Chart'
import MarketBar from './MarketBar'
import PositionManager from './PositionManager'
import TradeForm from './TradeForm'

export default function Trade() {
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
