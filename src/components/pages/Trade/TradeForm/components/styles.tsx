import { Flex, FlexProps, IconButton, Text } from '@chakra-ui/react'
import CloseX from '@public/icons/close-x.svg'
import Link from 'next/link'

import { Container } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'

import { useStyles, useTradeFormCopy } from '../hooks'

export const FormOverlayHeader = ({ title, onClose }: { title: string; onClose: () => void }) => {
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

      <IconButton variant="text" icon={<CloseX />} aria-label={copy.closePosition} onClick={onClose} />
    </Flex>
  )
}

export const MarketClosedMessage = (props: FlexProps) => {
  const copy = useTradeFormCopy()
  return (
    <Container borderColor="white" {...props}>
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

export const GeoBlockedMessage = (props: FlexProps) => {
  const copy = useTradeFormCopy()

  const TosLink = (
    <Link href="/tos" target="_blank" rel="noopener noferrer">
      <Text as="span" textDecoration="underline" _hover={{ color: colors.brand.whiteAlpha[60] }}>
        {copy.termsOfService}
      </Text>
    </Link>
  )

  const ClosingPositions = (
    <Text as="span" fontWeight={700} color={colors.brand.whiteAlpha[80]}>
      {copy.closingPositions}
    </Text>
  )
  return (
    <Container borderColor="white" {...props}>
      <Flex flexDirection="column" p={2} gap={2}>
        <Text>{copy.unsupportedRegion}</Text>
        <Text fontSize="12px" color={colors.brand.whiteAlpha[50]}>
          {copy.unsupportedRegionMessage(TosLink, ClosingPositions)}
        </Text>
      </Flex>
    </Container>
  )
}
