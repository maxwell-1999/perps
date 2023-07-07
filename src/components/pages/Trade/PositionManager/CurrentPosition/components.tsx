import { Flex, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { useIntl } from 'react-intl'

import { DataRow } from '@/components/design-system'
import { breakpoints } from '@/components/design-system/theme/styles'
import { PositionDetails } from '@/hooks/markets'

import { usePnl, usePositionManagerCopy, useStyles } from '../hooks'

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
  display: none;

  @media (min-width: ${breakpoints.mdd}) {
    display: flex;
    border-right: 1px solid ${(p) => p.borderColor};
    width: 45%;
  }
`

export const RightContainer = styled(Flex)`
  flex-direction: column;
  width: 100%;
  padding: 15px 24px 30px 24px;
  flex: 1;
  @media (min-width: ${breakpoints.mdd}) {
    width: 55%;
    padding-bottom: 21px;
  }
`

export const HiddenOnLargeScreen = styled(Flex)`
  flex-direction: column;
  width: 100%;
  @media (min-width: ${breakpoints.mdd}) {
    display: none;
  }
`

export const ActivePositionHeader = styled(Flex)<{ borderColor: string }>`
  justify-content: space-between;
  flex-wrap: wrap;
  min-height: 55px;
  align-items: center;
  padding: 4px 16px;
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
  overflow-y: auto;

  @media (min-width: ${breakpoints.mdd}) {
    flex-direction: row;
  }
`

export const DesktopButtonContainer = styled(Flex)`
  display: none;
  @media (min-width: ${breakpoints.mdd}) {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    padding-top: 10px;
  }
`

export const PnlPositionDetail = ({ positionDetails }: { positionDetails: PositionDetails }) => {
  const copy = usePositionManagerCopy()
  const { pnl, pnlPercentage, isPnlPositive } = usePnl({ positionDetails, live: true })
  const { red, green } = useStyles()
  const pnlTextColor = isPnlPositive ? green : red

  return <ActivePositionDetail label={copy.pnl} value={pnl} valueSubheader={pnlPercentage} valueColor={pnlTextColor} />
}

export const PnlDataRow = ({ positionDetails }: { positionDetails: PositionDetails }) => {
  const copy = usePositionManagerCopy()
  const { pnl, pnlPercentage, isPnlPositive } = usePnl({ positionDetails, live: true })
  const { red, green } = useStyles()
  const pnlTextColor = isPnlPositive ? green : red

  return (
    <DataRow
      label={copy.pnl}
      value={
        <Text fontSize="14px" color={pnlTextColor}>
          {/*eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
          {pnl} / {pnlPercentage}
        </Text>
      }
    />
  )
}

export const FundingRateTooltip = ({
  hourlyFunding,
  eightHourFunding,
  dailyFunding,
  yearlyFunding,
}: {
  hourlyFunding: string
  eightHourFunding: string
  dailyFunding: string
  yearlyFunding: string
}) => {
  const copy = usePositionManagerCopy()
  return (
    <Flex flexDirection="column" gap={2}>
      <Flex alignItems="center" justifyContent="space-between" gap={4}>
        <Text variant="label">{copy.fundingRate1hr}</Text>
        <Text fontSize="13px">{hourlyFunding}</Text>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between" gap={4}>
        <Text variant="label">{copy.fundingRate8hr}</Text>
        <Text fontSize="13px">{eightHourFunding}</Text>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between" gap={4}>
        <Text variant="label">{copy.fundingRate24hr}</Text>
        <Text fontSize="13px">{dailyFunding}</Text>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between" gap={4}>
        <Text variant="label">{copy.fundingRateYearly}</Text>
        <Text fontSize="13px">{yearlyFunding}</Text>
      </Flex>
    </Flex>
  )
}
