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

import { AssetIconWithText } from '@/components/shared/components'
import { useMarketContext } from '@/contexts/marketContext'

import { Button, IconButton } from '@ds/Button'

import { useSelectorCopy } from '../hooks'
import { MakerButtonLabel, MakerOptions, TakerOptions } from './components'

function MarketSelector() {
  const { selectedMakerMarket, isMaker, assetMetadata } = useMarketContext()
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
          label={
            <AssetIconWithText
              market={assetMetadata}
              text={isMaker && <MakerButtonLabel makerMarket={selectedMakerMarket} />}
            />
          }
          variant="pairSelector"
          rightIcon={<HamburgerIcon height="20px" width="20px" />}
          minWidth={{ base: '160px', xs: '179px' }}
        />
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
        <PopoverBody>{isMaker ? <MakerOptions onClose={onClose} /> : <TakerOptions onClose={onClose} />}</PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default MarketSelector
