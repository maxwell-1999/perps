import { useBreakpointValue } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

import {
  ChartGridItem,
  HeaderGridItem,
  MarketBarGridItem,
  PositionManagerGridItem,
  TradeFormGridItem,
  TradeLayout,
} from '@/components/layout/TradeLayout'
import { MarketProvider } from '@/contexts/marketContext'
import { PositionProvider } from '@/contexts/positionContext'
import { TradeFormProvider } from '@/contexts/tradeFormContext'

import Chart from './Chart'
import MarketBar from './MarketBar'
import PositionManager from './PositionManager'
import TradeForm from './TradeForm'

const NavBar = dynamic(() => import('@/components/shared/NavBar'), {
  ssr: false,
})

export default function Trade() {
  const isBase = useBreakpointValue({ base: true, md: false })
  return (
    <MarketProvider>
      <PositionProvider>
        <TradeFormProvider>
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
            {!isBase && (
              <>
                <ChartGridItem>
                  <Chart />
                </ChartGridItem>
                <PositionManagerGridItem>
                  <PositionManager />
                </PositionManagerGridItem>
              </>
            )}
          </TradeLayout>
        </TradeFormProvider>
      </PositionProvider>
    </MarketProvider>
  )
}
