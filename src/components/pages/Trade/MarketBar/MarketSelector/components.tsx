import { Flex, Text, useColorModeValue } from '@chakra-ui/react'
import Image from 'next/image'

import { TrackingEvents, useMixpanel } from '@/analytics'
import colors from '@/components/design-system/theme/colors'
import { AssetMetadata, ChainMarkets2, SupportedAsset } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { Big6Math, formatBig6USDPrice } from '@/utils/big6Utils'
import { calcNotional } from '@/utils/positionUtils'

import { Button } from '@ds/Button'

const AssetButtonLabel = ({
  name,
  symbol,
  price,
  liquidity,
  icon,
  nameOverride,
}: AssetMetadata[SupportedAsset] & { price: string; liquidity: string; nameOverride?: React.ReactNode }) => (
  <Flex flex={1} justifyContent="space-between" alignItems="center">
    <Flex alignItems="center">
      <Image src={icon} height={25} width={25} alt={name} />
      <Flex ml={2} flexDirection="column" alignItems="flex-start">
        <Text fontSize="16px" mb={1}>
          {nameOverride ? nameOverride : name}
        </Text>
        <Text variant="label">{symbol}</Text>
      </Flex>
    </Flex>
    <Flex ml={2} flexDirection="column" alignItems="flex-end">
      <Text fontSize="16px" mb={1}>
        {price}
      </Text>
      <Text variant="label">{liquidity}</Text>
    </Flex>
  </Flex>
)

interface AssetButtonProps {
  isSelected: boolean
  onClick: () => void
  liquidity: string
  price: string
  assetMetaData: AssetMetadata[SupportedAsset]
  nameOverride?: React.ReactNode
}

export const AssetButton = (props: AssetButtonProps) => {
  const hoverColor = useColorModeValue(colors.brand.gray[250], colors.brand.gray[250])
  const { assetMetaData, price, liquidity, isSelected, onClick, nameOverride } = props

  return (
    <Button
      variant="pairDropdown"
      onClick={onClick}
      bg={isSelected ? '#0E0E0E' : undefined}
      _hover={isSelected ? {} : { bg: hoverColor }}
      label={<AssetButtonLabel {...assetMetaData} price={price} liquidity={liquidity} nameOverride={nameOverride} />}
    />
  )
}

export const MarketOptions = ({ isMaker, onClose }: { isMaker: boolean; onClose: () => void }) => {
  const { chainId, snapshots2, setSelectedMarket, selectedMarket, setSelectedMakerMarket, selectedMakerMarket } =
    useMarketContext()
  const { track } = useMixpanel()
  return (
    <>
      {Object.keys(ChainMarkets2[chainId]).map((market) => {
        const marketSnapshot = snapshots2?.market?.[market as SupportedAsset]
        const marketPrice = marketSnapshot?.global?.latestPrice ?? 0n

        return (
          <AssetButton
            key={market}
            assetMetaData={AssetMetadata[market as SupportedAsset]}
            price={formatBig6USDPrice(Big6Math.abs(marketPrice))}
            liquidity={formatBig6USDPrice(calcNotional(marketSnapshot?.position?.maker ?? 0n, marketPrice), {
              compact: true,
            })}
            isSelected={market === (isMaker ? selectedMakerMarket : selectedMarket)}
            onClick={() => {
              isMaker ? setSelectedMakerMarket(market as SupportedAsset) : setSelectedMarket(market as SupportedAsset)
              track(TrackingEvents.selectMarket, { market: AssetMetadata[market as SupportedAsset].symbol })
              onClose()
            }}
          />
        )
      })}
    </>
  )
}
