import { useEffect, useState } from 'react'

import DDArrow from '@/SVG/Elements/Arrow'
import { TrackingEvents, useMixpanel } from '@/analytics'
import { useMarketContext } from '@/contexts/marketContext'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@ds/Tabs'

import AllPositions from './AllPositions'
import CurrentPosition from './CurrentPosition'
import HistoricalPositions from './HistoricalPositions'
import Orders from './Orders'
import { usePositionManagerCopy } from './hooks'

const hideClass = 'hide-position-custom-class'
function PositionManager() {
  const { activePositionTab, setActivePositionTab } = useMarketContext()

  const copy = usePositionManagerCopy()
  const { track } = useMixpanel()

  const onChangePositionTab = (index: number) => {
    setActivePositionTab(index)
    const selectedTab = index === 0 ? copy.thisPosition : index === 1 ? copy.allPositions : copy.history
    track(TrackingEvents.changePositionManager, { selectedTab })
  }
  const [hide, setHide] = useState(false)
  useEffect(() => {
    if (hide) {
      document.getElementById('root-layout-div')?.classList.add(hideClass)
    } else {
      document.getElementById('root-layout-div')?.classList.remove(hideClass)
    }
  }, [hide])
  useEffect(() => {
    setHide(false)
  }, [activePositionTab])
  return (
    <Tabs isLazy index={activePositionTab} onChange={onChangePositionTab} className="!bg-[#282b39]">
      <div className="flex justify-between w-full">
        <TabList className="w-fit">
          <Tab>{copy.thisPosition}</Tab>
          <Tab>{copy.allPositions}</Tab>
          <Tab>{copy.orders}</Tab>
          <Tab>{copy.history}</Tab>
        </TabList>
        <button
          className="flex items-center px-4 transition gap-x-2 text-f14 group"
          onClick={() => {
            setHide(!hide)
          }}
        >
          {(hide ? 'Show' : 'Hide') + ' Positions'}{' '}
          <DDArrow className={`transition scale group-hover:scale-150  ${!hide ? ' rotate-0' : 'rotate-180'}`} />
        </button>
      </div>
      {/* // 141823j
// 171722
// 1c1c28 */}
      <TabPanels className="bg-[#141823j]">
        <TabPanel display="flex" flexDirection="column" flex={1}>
          <CurrentPosition />
        </TabPanel>
        <TabPanel>
          <AllPositions />
        </TabPanel>
        <TabPanel>
          <Orders />
        </TabPanel>
        <TabPanel>
          <HistoricalPositions />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default PositionManager
