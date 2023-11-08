import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import { TrackingEvents, useMixpanel } from '@/analytics'
import { useMarketContext } from '@/contexts/marketContext'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@ds/Tabs'

import MarketInfo from './MarketInfo'
import { useChartCopy } from './hooks'

const AdvancedRealTimeChart = dynamic(() => import('./TradingviewWidget'), { ssr: false })

function Chart() {
  const { isMaker } = useMarketContext()
  const { priceChart, marketInfo } = useChartCopy()
  const [canRender, setCanRender] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { track } = useMixpanel()

  useEffect(() => {
    if (!!containerRef.current && !canRender) setCanRender(true)
  }, [containerRef, canRender])

  const trackChartTab = (index: number) => {
    track(TrackingEvents.changeChart, { chartType: index === 0 ? priceChart : marketInfo })
  }

  return (
    <Tabs onChange={trackChartTab} className="!bg-[#131722]">
      <TabList className="!bg-[#131722] !w-fit">
        <Tab>{priceChart}</Tab>
        <Tab>{marketInfo}</Tab>
      </TabList>
      <TabPanels className="bg-[#171722]">
        <TabPanel display="flex" flexDirection="column" flex={1}>
          <Box height="100%" p={0}>
            <div id="tv-widget-container" style={{ height: '100%' }} ref={containerRef} />
            {canRender && <AdvancedRealTimeChart theme="dark" containerId="tv-widget-container" isMaker={isMaker} />}
          </Box>
        </TabPanel>
        <TabPanel>
          <MarketInfo />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default Chart
