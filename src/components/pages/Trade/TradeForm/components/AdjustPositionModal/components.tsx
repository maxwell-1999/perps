import { Box, Flex, Spinner, Text, useColorModeValue } from '@chakra-ui/react'
import CheckMark from '@public/icons/checkmark.svg'
import RightArrow from '@public/icons/position-change-arrow.svg'

import { FormattedBig18, FormattedBig18USDPrice } from '@/components/shared/components'
import { SupportedAsset } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'

import colors from '@ds/theme/colors'

import { useAdjustmentModalCopy } from './hooks'

const ModalDetailContainer = ({ children }: { children: React.ReactNode }) => {
  const bg = useColorModeValue(colors.brand.whiteAlpha[20], colors.brand.blackAlpha[20])
  const borderColor = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  return (
    <Flex
      flexDirection="column"
      mb={4}
      bg={bg}
      borderRadius="8px"
      border={`1px solid ${borderColor}`}
      py="12px"
      px="14px"
      width="100%"
    >
      {children}
    </Flex>
  )
}

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
}

export function PositionInfo({
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
  const sideColor = isLong ? colors.brand.green : colors.brand.purple[240]

  return (
    <ModalDetailContainer>
      <Flex flexDirection="column">
        <Text variant="label" fontSize="12px" mb="5px">
          {copy.side}
        </Text>
        <Text mb="5px" color={sideColor}>
          {orderDirection === OrderDirection.Long ? copy.long : copy.short}
        </Text>
      </Flex>

      <PositionValueDisplay title={copy.positionSize} newValue={newPosition} prevValue={prevPosition} asset={asset} />
      <PositionValueDisplay title={copy.collateral} newValue={newCollateral} prevValue={prevCollateral} usd />
      <PositionValueDisplay title={copy.leverage} newValue={newLeverage} prevValue={prevLeverage} leverage isLast />
    </ModalDetailContainer>
  )
}

const StepIncomplete = () => (
  <Box height="16px" width="16px" borderRadius="full" border={`3px solid ${colors.brand.gray[100]}`} />
)
interface AdjustmentStepProps {
  title: string
  description: string
  isLoading?: boolean
  isCompleted?: boolean
}

export const AdjustmentStep: React.FC<AdjustmentStepProps> = ({ title, description, isLoading, isCompleted }) => {
  const bg = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])

  return (
    <Flex mb="22px">
      <Flex
        width="40px"
        height="40px"
        bg={bg}
        borderRadius="full"
        mr="12px"
        alignItems="center"
        justifyContent="center"
      >
        {isCompleted ? (
          <Flex height="20px" width="20px">
            <CheckMark height="20px" width="20px" />
          </Flex>
        ) : isLoading ? (
          <Spinner
            size="sm"
            thickness="3px"
            speed="0.65s"
            emptyColor={colors.brand.darkGreen}
            color={colors.brand.green}
          />
        ) : (
          <StepIncomplete />
        )}
      </Flex>
      <Flex flexDirection="column" flex={1}>
        <Text fontSize="15px" mb="3px">
          {title}
        </Text>
        <Text variant="label">{description}</Text>
      </Flex>
    </Flex>
  )
}

interface TransferDetailProps {
  title: string
  action: string
  detail: string | React.ReactNode
  color: string
}

export const TransferDetail: React.FC<TransferDetailProps> = ({ title, action, detail, color }) => {
  return (
    <ModalDetailContainer>
      <Text variant="label" fontSize="12px" mb="5px">
        {title}
      </Text>
      <Text fontSize="15px">
        <Text as="span" color={color} mr={1}>
          {action}
        </Text>
        {detail}
      </Text>
    </ModalDetailContainer>
  )
}
