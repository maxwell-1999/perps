import { PositionManagerGridItem } from '@/components/layout/TradeLayout'
import { usePositionViewManager } from '@/pages/trade'

import PositionManager from './PositionManager'

const MobileTradeView: React.FC<any> = ({}) => {
  const { closePositonView } = usePositionViewManager()
  return (
    <div>
      <div onClick={closePositonView}>Close</div>
      <PositionManagerGridItem>
        <PositionManager />
      </PositionManagerGridItem>
    </div>
  )
}

export { MobileTradeView }
