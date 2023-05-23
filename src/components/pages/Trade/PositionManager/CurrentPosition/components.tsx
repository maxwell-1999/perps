import { Flex, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { useIntl } from 'react-intl'

import { breakpoints } from '@/components/design-system/theme/styles'

import { useStyles } from '../hooks'

export const StatusLight = styled.div<{ color: string; glow: boolean }>`
  height: 6px;
  width: 6px;
  border-radius: 50%;
  background-color: ${(p) => p.color};
  box-shadow: ${(p) => (p.glow ? `0 0 6px ${p.color}` : 'none')};
`

export const LeverageBadge = ({ leverage }: { leverage: string | number }) => {
  const { borderColor } = useStyles()
  const intl = useIntl()
  const leverageMsg = intl.formatMessage({ defaultMessage: '{leverage}x' }, { leverage })

  return (
    <Flex justifyContent="center" alignItems="center" padding="5px" bg={borderColor} borderRadius="5px">
      <Text fontSize="13px">{leverageMsg}</Text>
    </Flex>
  )
}

export const LeftContainer = styled(Flex)<{ borderColor: string }>`
  border-right: 1px solid ${(p) => p.borderColor};
  width: 45%;
`

export const RightContainer = styled(Flex)`
  flex-direction: column;
  width: 55%;
  max-width: 650px;
  padding: 15px 24px 21px 24px;
`

export const ActivePositionHeader = styled(Flex)<{ borderColor: string }>`
  justify-content: space-between;
  min-height: 55px;
  align-items: center;
  padding: 0 16px;
  width: 100%;
  border-bottom: 1px solid ${(p) => p.borderColor};
`

interface ActivePositionDetailProps {
  label: string
  value: React.ReactNode
  valueSubheader: React.ReactNode
  valueColor?: string
}

export const ActivePositionDetail = ({
  label,
  value,
  valueColor,
  valueSubheader,
  ...props
}: ActivePositionDetailProps) => {
  const { subheaderTextColor, alpha90 } = useStyles()
  return (
    <Flex
      flexDirection="column"
      justifyContent="space-between"
      p={'14px'}
      {...props}
      height="100%"
      // maxHeight="138px"
    >
      <Text fontSize="13px" color={alpha90}>
        {label}
      </Text>
      <Flex flexDirection="column">
        <Text fontSize="26px" color={valueColor ? valueColor : 'initial'}>
          {value}
        </Text>
        <Text fontSize="13px" color={subheaderTextColor}>
          {valueSubheader}
        </Text>
      </Flex>
    </Flex>
  )
}

export const ResponsiveContainer = styled(Flex)`
  height: 100%;
  flex-direction: column;
  @media (min-width: ${breakpoints.smd}) {
    flex-direction: row;
  }
`
