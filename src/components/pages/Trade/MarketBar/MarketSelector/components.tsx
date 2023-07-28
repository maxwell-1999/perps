import { Flex, Text, useColorModeValue } from '@chakra-ui/react'
import Image from 'next/image'

import { TrackingEvents, useMixpanel } from '@/analytics'
import colors from '@/components/design-system/theme/colors'
import { AssetMetadata, SupportedAsset, SupportedMakerMarket } from '@/constants/assets'
import { ChainMarkets, OrderDirection } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { Big18Math, formatBig18USDPrice } from '@/utils/big18Utils'
import { getMakerAssetAndDirection } from '@/utils/makerMarketUtils'

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

export const TakerOptions = ({ onClose }: { onClose: () => void }) => {
  const { chainId, snapshots, setSelectedMarket, selectedMarket } = useMarketContext()
  const { track } = useMixpanel()
  return (
    <>
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
          liquidity={`${formatBig18USDPrice(snapshots?.[market as SupportedAsset]?.Long?.openInterest?.maker ?? 0n, {
            compact: true,
          })} / ${formatBig18USDPrice(snapshots?.[market as SupportedAsset]?.Short?.openInterest?.maker ?? 0n, {
            compact: true,
          })}`}
          isSelected={market === selectedMarket}
          onClick={() => {
            setSelectedMarket(market as any)
            track(TrackingEvents.selectMarket, { market: AssetMetadata[market as SupportedAsset].symbol })
            onClose()
          }}
        />
      ))}
    </>
  )
}

export const MakerOptions = ({ onClose }: { onClose: () => void }) => {
  const { chainId, snapshots, setSelectedMakerMarket, selectedMakerMarket } = useMarketContext()
  const { track } = useMixpanel()
  return (
    <>
      {Object.keys(ChainMarkets[chainId]).map((asset) => {
        return Object.keys(ChainMarkets?.[chainId]?.[asset as SupportedAsset] || {}).map((orderDirection) => {
          const marketName = `${asset}-${orderDirection}`
          return (
            <AssetButton
              key={marketName}
              nameOverride={<MakerButtonLabel makerMarket={marketName as SupportedMakerMarket} />}
              assetMetaData={AssetMetadata[asset as SupportedAsset]}
              price={formatBig18USDPrice(
                Big18Math.abs(
                  snapshots?.[asset as SupportedAsset]?.Long?.latestVersion?.price ??
                    snapshots?.[asset as SupportedAsset]?.Short?.latestVersion?.price ??
                    0n,
                ),
              )}
              liquidity={`${formatBig18USDPrice(
                snapshots?.[asset as SupportedAsset]?.[orderDirection as OrderDirection]?.openInterest?.maker ?? 0n,
                {
                  compact: true,
                },
              )}`}
              isSelected={marketName === selectedMakerMarket}
              onClick={() => {
                setSelectedMakerMarket(marketName as SupportedMakerMarket)
                track(TrackingEvents.selectMakerMarket, { makerMarket: marketName })
                onClose()
              }}
            />
          )
        })
      })}
    </>
  )
}

export const MakerButtonLabel = ({ makerMarket }: { makerMarket: SupportedMakerMarket }) => {
  const { asset, orderDirection } = getMakerAssetAndDirection(makerMarket)
  const directionColor = orderDirection === OrderDirection.Long ? colors.brand.green : colors.brand.red
  return (
    <>
      {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
      {asset.toUpperCase()} -{' '}
      <Text as="span" color={directionColor}>
        {orderDirection}
      </Text>
    </>
  )
}
