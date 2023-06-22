import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import RightArrow from '@public/icons/position-change-arrow.svg'
import { memo } from 'react'

import { ModalDetailContainer } from '@/components/shared/ModalComponents'
import { FormattedBig18, FormattedBig18USDPrice } from '@/components/shared/components'
import { SupportedAsset } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'

import colors from '@ds/theme/colors'

import { useAdjustmentModalCopy } from './hooks'

const PositionValueDisplay = ({
  title,
  newValue,
  prevValue,
  usd,
  asset,
  leverage,
  isLast,
}: {
  title: string
  newValue: bigint
  prevValue: bigint
  usd?: boolean
  leverage?: boolean
  asset?: SupportedAsset
  isLast?: boolean
}) => {
  const previousColor = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])

  return (
    <Flex flexDirection="column" mb={isLast ? 0 : 2}>
      <Text variant="label" fontSize="12px" mb="5px">
        {title}
      </Text>
      <Flex alignItems="center">
        <Box mr={2}>
          {!!usd ? (
            <FormattedBig18USDPrice fontSize="15px" color={previousColor} value={prevValue} />
          ) : (
            <FormattedBig18 fontSize="15px" color={previousColor} value={prevValue} asset={asset} leverage={leverage} />
          )}
        </Box>
        <Box height="10px" width="10px" mr={2}>
          <RightArrow />
        </Box>
        <Box>
          {!!usd ? (
            <FormattedBig18USDPrice fontSize="15px" value={newValue} />
          ) : (
            <FormattedBig18 fontSize="15px" value={newValue} asset={asset} leverage={leverage} />
          )}
        </Box>
      </Flex>
    </Flex>
  )
}

interface PositionInfoProps {
  newCollateral: bigint
  prevCollateral: bigint
  newLeverage: bigint
  prevLeverage: bigint
  newPosition: bigint
  prevPosition: bigint
  asset: SupportedAsset
  isPrevious?: boolean
  orderDirection: OrderDirection
  frozen: boolean
}

export const PositionInfo = memo(
  function PositionInfo({
    newCollateral,
    newLeverage,
    newPosition,
    prevCollateral,
    prevLeverage,
    prevPosition,
    asset,
    orderDirection,
  }: PositionInfoProps) {
    const copy = useAdjustmentModalCopy()
    const isLong = orderDirection === OrderDirection.Long
    const sideColor = isLong ? colors.brand.green : colors.brand.red

    return (
      <ModalDetailContainer>
        <Flex flexDirection="column" mb={2}>
          <Text variant="label" fontSize="12px">
            {copy.side}
          </Text>
          <Text color={sideColor}>{orderDirection === OrderDirection.Long ? copy.long : copy.short}</Text>
        </Flex>

        <PositionValueDisplay title={copy.positionSize} newValue={newPosition} prevValue={prevPosition} asset={asset} />
        <PositionValueDisplay title={copy.collateral} newValue={newCollateral} prevValue={prevCollateral} usd />
        <PositionValueDisplay title={copy.leverage} newValue={newLeverage} prevValue={prevLeverage} leverage isLast />
      </ModalDetailContainer>
    )
  },
  ({ frozen: preFrozen }, { frozen }) => frozen && preFrozen, // Force no re-renders based on prop changes if marked as frozen
)
