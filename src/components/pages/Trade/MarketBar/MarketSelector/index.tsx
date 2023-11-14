import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import CloseX from '@public/icons/close-x.svg'

import DDArrow from '@/SVG/Elements/Arrow'
import { AssetIconWithText } from '@/components/shared/components'
import { AssetMetadata } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'

import { Button, IconButton } from '@ds/Button'

import { useSelectorCopy } from '../hooks'
import { MarketOptions } from './components'

function MarketSelector() {
  const { assetMetadata, isMaker, selectedMakerMarket } = useMarketContext()
  const { isOpen, onOpen, onClose } = useDisclosure({ id: 'marketSelector' })
  const copy = useSelectorCopy()

  return (
    <Popover
      placement="bottom-start"
      variant="assetSelector"
      offset={[-5, 6]}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isLazy
    >
      <PopoverTrigger>
        <Button
          label={<AssetIconWithText market={isMaker ? AssetMetadata[selectedMakerMarket] : assetMetadata} />}
          variant="pairSelector"
          rightIcon={<DDArrow className="scale-150 sm:hidden" />}
          minWidth={{ base: '160px', xs: '179px' }}
          className="!bg-transparent !border-none nsm:!min-w-[140px] sm:!min-w-[100px] sm:!w-[100px] sm:text-[14px] sm:!p-2 sm:!ml-1 nsm:!pl-2 nsm:!ml-[0px] sm:!h-fit"
        />
        {/* <div>h</div> */}
      </PopoverTrigger>
      <PopoverContent width={{ base: '304px', xl: '400px' }}>
        <PopoverHeader>
          <Flex flex={1} alignItems="center" justifyContent="space-between" mb="14px">
            <Text fontSize="17px">{copy.switchMarket}</Text>
            <IconButton variant="text" icon={<CloseX />} aria-label={copy.close} onClick={onClose} />
          </Flex>
          <Flex flex={1} justifyContent="space-between">
            <Text variant="label">{copy.market}</Text>
            <Text variant="label">{copy.priceLiquidity}</Text>
          </Flex>
        </PopoverHeader>
        <PopoverBody>{<MarketOptions isMaker={isMaker} onClose={onClose} />}</PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default MarketSelector
