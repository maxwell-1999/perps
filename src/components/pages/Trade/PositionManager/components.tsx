import { Box, Flex, Text } from '@chakra-ui/react'
import Image from 'next/image'

import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { OrderDirection, PositionStatus } from '@/constants/markets'

import colors from '@ds/theme/colors'

import { getStatusDetails } from '@utils/positionUtils'

import { StatusLight } from './CurrentPosition/components'
import { usePositionManagerCopy } from './hooks'

export const AssetDirectionLabel = ({
  market,
  direction,
}: {
  market: AssetMetadata[SupportedAsset]
  direction: OrderDirection
}) => {
  const directionColor = direction === OrderDirection.Long ? colors.brand.green : colors.brand.red
  return (
    <Flex alignItems="center">
      <Box mr={3}>
        <Image src={market.icon} height={25} width={25} alt={market.name} />
      </Box>
      <Flex flexDirection="column">
        <Text fontSize="15px">{market.symbol}</Text>
        <Text fontSize="13px" color={directionColor}>
          {direction}
        </Text>
      </Flex>
    </Flex>
  )
}

export const Status = ({ status }: { status: PositionStatus }) => {
  const { statusColor, isOpenPosition } = getStatusDetails(status)
  const copy = usePositionManagerCopy()
  const statusLabel = copy[status]

  return (
    <Flex alignItems="center">
      <StatusLight color={statusColor} glow={isOpenPosition} />
      <Text fontSize="14px" ml={3}>
        {statusLabel}
      </Text>
    </Flex>
  )
}

export const TableEmptyScreen = ({ message }: { message: string }) => {
  return (
    <Flex alignItems="center" justifyContent="center" flexDirection="column" py={10}>
      <Text mt={2} fontSize="15px" variant="label">
        {message}
      </Text>
    </Flex>
  )
}
