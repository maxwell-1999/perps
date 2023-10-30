import { WarningTwoIcon } from '@chakra-ui/icons'
import { Flex, FlexProps, IconButton, Text } from '@chakra-ui/react'
import CloseX from '@public/icons/close-x.svg'
import Link from 'next/link'

import { Container } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import { PositionSide2 } from '@/constants/markets'

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

export const PaddedContainer = ({ children, ...props }: { children: React.ReactNode } & FlexProps) => (
  <Flex p="16px" pb="8x" flexDirection="column" {...props}>
    {children}
  </Flex>
)

export const FormContainer = ({
  children,
  variant,
  isMobile,
  ...props
}: { children: React.ReactNode; variant: 'transparent' | 'active' | 'pink'; isMobile?: boolean } & FlexProps) => (
  <Container
    height={{ base: isMobile ? '100%' : '0px', xl: 'fit-content' }}
    minHeight={{ base: '100%', xl: 'initial' }}
    p="0"
    variant={variant}
    overflowY="auto"
    {...props}
  >
    {children}
  </Container>
)
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

export const VpnDetectedMessage = (props: FlexProps) => {
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
        <Text>{copy.vpnDetected}</Text>
        <Text fontSize="12px" color={colors.brand.whiteAlpha[50]}>
          {copy.vpnDetectedMessage(TosLink, ClosingPositions)}
        </Text>
      </Flex>
    </Container>
  )
}

export const TriggerBetaMessage = (props: FlexProps) => {
  const copy = useTradeFormCopy()

  return (
    <Container borderColor="white" {...props}>
      <Flex flexDirection="column" p={2} gap={2}>
        <Flex alignItems="center">
          <WarningTwoIcon color="yellow.400" mr={2} />
          <Text fontSize="12px" color={colors.brand.whiteAlpha[80]}>
            {copy.triggerBetaMessage}
          </Text>
        </Flex>
      </Flex>
    </Container>
  )
}

export const SocializationMessage = ({
  minorSide,
  hasPosition,
  ...props
}: { minorSide: PositionSide2; hasPosition: boolean } & FlexProps) => {
  const copy = useTradeFormCopy()
  return (
    <Container border="none" bg={colors.brand.purpleAlpha[10]} {...props}>
      <Flex flexDirection="column" p={2} gap={2}>
        <Text>{copy.liquidityImbalance}</Text>
        <Text fontSize="12px" color={colors.brand.whiteAlpha[50]}>
          {copy.liquidityImbalanceMessage(minorSide)}
          {hasPosition && (
            <Text as="span" ml={1}>
              {copy.reduceYourPosition}
            </Text>
          )}
        </Text>
      </Flex>
    </Container>
  )
}

export const RestrictionMessage = ({ message }: { message: string }) => (
  <Flex mb="12px">
    <Text fontSize="11px" color={colors.brand.red}>
      {message}
    </Text>
  </Flex>
)
