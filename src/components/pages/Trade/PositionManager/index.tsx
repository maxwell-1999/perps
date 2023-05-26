import { Box } from '@chakra-ui/react'

import { useMarketContext } from '@/contexts/marketContext'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@ds/Tabs'

import AllPositions from './AllPositions'
import CurrentPosition from './CurrentPosition'
import { usePositionManagerCopy } from './hooks'

function PositionManager() {
  const { activePositionTab, setActivePositionTab } = useMarketContext()
  console.log(activePositionTab)
  const copy = usePositionManagerCopy()

  return (
    <Tabs isLazy index={activePositionTab} onChange={setActivePositionTab}>
      <TabList>
        <Tab>{copy.thisPosition}</Tab>
        <Tab>{copy.allPositions}</Tab>
        <Tab>{copy.history}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel display="flex" flexDirection="column" flex={1}>
          <CurrentPosition />
        </TabPanel>
        <TabPanel>
          <AllPositions />
        </TabPanel>
        <TabPanel>
          <Box padding={4}>{copy.history}</Box>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default PositionManager
