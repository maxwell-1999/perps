import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@ds/Tabs'

import MarketInfo from './MarketInfo'
import { useChartCopy } from './hooks'

const AdvancedRealTimeChart = dynamic(() => import('./TradingviewWidget'), { ssr: false })

function Chart() {
  const { priceChart, marketInfo } = useChartCopy()
  const [canRender, setCanRender] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!!containerRef.current && !canRender) setCanRender(true)
  }, [containerRef, canRender])

  return (
    <Tabs>
      <TabList>
        <Tab>{priceChart}</Tab>
        <Tab>{marketInfo}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel display="flex" flexDirection="column" flex={1}>
          <Box height="100%" p={0}>
            <div id="tv-widget-container" style={{ height: '100%' }} ref={containerRef} />
            {canRender && <AdvancedRealTimeChart theme="dark" containerId="tv-widget-container" />}
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
