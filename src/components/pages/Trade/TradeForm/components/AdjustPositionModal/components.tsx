import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'

import { FormattedBig18, FormattedBig18USDPrice } from '@/components/shared/components'
import { SupportedAsset } from '@/constants/assets'

import colors from '@ds/theme/colors'

import { useAdjustmentModalCopy } from './hooks'

const PositionValueDisplay = ({
  title,
  value,
  isPrevious,
  usd,
  asset,
  leverage,
}: {
  title: string
  value: bigint
  isPrevious?: boolean
  usd?: boolean
  leverage?: boolean
  asset?: SupportedAsset
}) => {
  const previousColor = useColorModeValue(colors.brand.blackAlpha[75], colors.brand.whiteAlpha[75])

  return (
    <Flex flexDirection="column" mb={2}>
      <Text variant="label" fontSize="12px">
        {title}
      </Text>
      <Box>
        {!!usd ? (
          <FormattedBig18USDPrice fontSize="15px" color={isPrevious ? previousColor : 'initial'} value={value} />
        ) : (
          <FormattedBig18
            fontSize="15px"
            color={isPrevious ? previousColor : 'initial'}
            value={value}
            asset={asset}
            leverage={leverage}
          />
        )}
      </Box>
    </Flex>
  )
}

interface PositionInfoProps {
  collateral: bigint
  leverage: bigint
  position: bigint
  asset: SupportedAsset
  isPrevious?: boolean
}

export function PositionInfo({ collateral, leverage, position, asset, isPrevious }: PositionInfoProps) {
  const copy = useAdjustmentModalCopy()

  return (
    <Flex flexDirection="column" p={3} borderRadius="5px">
      <PositionValueDisplay title={copy.positionSize} value={position} isPrevious={isPrevious} asset={asset} />
      <PositionValueDisplay title={copy.collateral} value={collateral} isPrevious={isPrevious} usd />
      <PositionValueDisplay title={copy.leverage} value={leverage} isPrevious={isPrevious} leverage />
    </Flex>
  )
}
