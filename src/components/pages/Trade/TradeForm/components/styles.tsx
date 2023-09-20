import { Flex, IconButton, Text } from '@chakra-ui/react'
import CloseX from '@public/icons/close-x.svg'

import { Container } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'

import { useStyles, useTradeFormCopy } from '../hooks'

export const FormOverlayHeader = ({
  title,
  onClose,
  marketClosed,
  rightEl,
}: {
  title: string
  onClose: () => void
  marketClosed?: boolean
  rightEl?: React.ReactNode
}) => {
  const copy = useTradeFormCopy()
  const { dashedBorderColor } = useStyles()

  return (
    <Flex
      justifyContent="space-between"
      px="16px"
      py="14px"
      mb="19px"
      alignItems="center"
      borderBottom={`1px dashed ${dashedBorderColor}`}
    >
      <Text fontSize="17px">{title}</Text>
      {rightEl && rightEl}
      {!rightEl && (
        <IconButton
          variant="text"
          icon={<CloseX />}
          aria-label={copy.closePosition}
          onClick={onClose}
          isDisabled={marketClosed}
        />
      )}
    </Flex>
  )
}

export const MarketClosedMessage = () => {
  const copy = useTradeFormCopy()
  return (
    <Container borderColor="white">
      <Flex flexDirection="column" p={2} gap={2}>
        <Flex alignItems="center">
          <Text>{copy.marketClosedTitle}</Text>
        </Flex>
        <Text fontSize="12px" color={colors.brand.whiteAlpha[50]}>
          {copy.marketClosedMessage}
        </Text>
      </Flex>
    </Container>
  )
}

export const GeoBlockedMessage = () => {
  const copy = useTradeFormCopy()
  return (
    <Container borderColor="white">
      <Flex flexDirection="column" p={2} gap={2}>
        <Text>{copy.unsupportedRegion}</Text>
        <Text fontSize="12px" color={colors.brand.whiteAlpha[50]}>
          {copy.unsupportedRegionMessage}
        </Text>
      </Flex>
    </Container>
  )
}
