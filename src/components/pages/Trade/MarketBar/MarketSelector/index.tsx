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
import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { ChainMarkets } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'

import { Button, IconButton } from '@ds/Button'

import { Big18Math, formatBig18USDPrice } from '@utils/big18Utils'

import { useSelectorCopy } from '../hooks'
import { AssetButton } from './components'

function MarketSelector() {
  const { chainId, selectedMarket, setSelectedMarket, snapshots } = useMarketContext()
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
          label={<AssetIconWithText market={AssetMetadata[selectedMarket]} />}
          variant="pairSelector"
          rightIcon={<HamburgerIcon height="20px" width="20px" />}
        />
      </PopoverTrigger>
      <PopoverContent>
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
        <PopoverBody>
          {Object.keys(ChainMarkets[chainId]).map((market) => (
            <AssetButton
              key={market}
              assetMetaData={AssetMetadata[market as SupportedAsset]}
              price={formatBig18USDPrice(
                Big18Math.abs(
                  snapshots?.[market as SupportedAsset]?.Long?.latestVersion?.price ??
                    snapshots?.[market as SupportedAsset]?.Short?.latestVersion?.price ??
                    0n,
                ),
              )}
              liquidity={`${formatBig18USDPrice(
                snapshots?.[market as SupportedAsset]?.Long?.openInterest?.maker ?? 0n,
                {
                  compact: true,
                },
              )} / ${formatBig18USDPrice(snapshots?.[market as SupportedAsset]?.Short?.openInterest?.maker ?? 0n, {
                compact: true,
              })}`}
              isSelected={market === selectedMarket}
              onClick={() => {
                setSelectedMarket(market as any)
                onClose()
              }}
            />
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default MarketSelector
