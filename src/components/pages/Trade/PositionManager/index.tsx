import { TrackingEvents, useMixpanel } from '@/analytics'
import { useMarketContext } from '@/contexts/marketContext'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@ds/Tabs'

import AllPositions from './AllPositions'
import CurrentPosition from './CurrentPosition'
import HistoricalPositions from './HistoricalPositions'
import { usePositionManagerCopy } from './hooks'

function PositionManager() {
  const { activePositionTab, setActivePositionTab } = useMarketContext()
  const copy = usePositionManagerCopy()
  const { track } = useMixpanel()

  const onChangePositionTab = (index: number) => {
    setActivePositionTab(index)
    const selectedTab = index === 0 ? copy.thisPosition : index === 1 ? copy.allPositions : copy.history
    track(TrackingEvents.changePositionManager, { selectedTab })
  }

  return (
    <Tabs isLazy index={activePositionTab} onChange={onChangePositionTab}>
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
          <HistoricalPositions />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default PositionManager
