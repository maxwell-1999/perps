import { Flex, Text, useColorModeValue } from '@chakra-ui/react'

import colors from '@ds/theme/colors'

import { useAdjustmentModalCopy } from './hooks'

const PositionValueDisplay = ({ title, value, isPrevious }: { title: string; value: string; isPrevious?: boolean }) => {
  const previousColor = useColorModeValue(colors.brand.blackAlpha[75], colors.brand.whiteAlpha[75])

  return (
    <Flex flexDirection="column" mb={2}>
      <Text variant="label" fontSize="12px">
        {title}
      </Text>
      <Text fontSize="15px" color={isPrevious ? previousColor : 'initial'}>
        {value}
      </Text>
    </Flex>
  )
}

interface PositionInfoProps {
  collateral: string
  leverage: string
  position: string
  isPrevious?: boolean
}

export function PositionInfo({ collateral, leverage, position, isPrevious }: PositionInfoProps) {
  const copy = useAdjustmentModalCopy()

  return (
    <Flex flexDirection="column" p={3} borderRadius="5px">
      <PositionValueDisplay title={copy.positionSize} value={position} isPrevious={isPrevious} />
      <PositionValueDisplay title={copy.collateral} value={collateral} isPrevious={isPrevious} />
      <PositionValueDisplay title={copy.leverage} value={leverage} isPrevious={isPrevious} />
    </Flex>
  )
}
