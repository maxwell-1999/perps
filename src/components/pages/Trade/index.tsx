import { Container, useBreakpointValue } from '@chakra-ui/react'
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
import { TradeFormProvider } from '@/contexts/tradeFormContext'

import Chart from './Chart'
import MarketBar from './MarketBar'
import TradeForm from './TradeForm'

const NavBar = dynamic(() => import('@/components/shared/NavBar'), {
  ssr: false,
})

const POSITION_MANAGER = 'Position Manager'

export default function Trade() {
  const isBase = useBreakpointValue({ base: true, md: false })
  return (
    <MarketProvider>
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
                <Container height="100%">{POSITION_MANAGER}</Container>
              </PositionManagerGridItem>
            </>
          )}
        </TradeLayout>
      </TradeFormProvider>
    </MarketProvider>
  )
}
