import { CloseIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'

import colors from '@/components/design-system/theme/colors'
import { PositionManagerGridItem } from '@/components/layout/TradeLayout'
import { usePositionViewManager } from '@/pages/trade'

import PositionManager from './PositionManager'

const MobileTradeView: React.FC<any> = ({}) => {
  const { closePositonView } = usePositionViewManager()
  return (
    <div>
      <Flex width="100%" justifyContent="flex-end">
        <IconButton
          icon={<CloseIcon color={colors.brand.whiteAlpha[70]} />}
          onClick={closePositonView}
          aria-label={'close app'}
          border="none"
          bg="transparent"
        />
      </Flex>
      <PositionManagerGridItem>
        <PositionManager />
      </PositionManagerGridItem>
    </div>
  )
}

export { MobileTradeView }
