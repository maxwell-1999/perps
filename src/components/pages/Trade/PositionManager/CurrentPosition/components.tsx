import { Box, Flex, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { useIntl } from 'react-intl'

import { DataRow } from '@/components/design-system'
import { Badge } from '@/components/design-system/Badge'
import { NoticeTooltip } from '@/components/design-system/Tooltip'
import { breakpoints } from '@/components/design-system/theme/styles'
import { SocializationNotice } from '@/components/shared/components'
import { PositionSide2 } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { useChainLivePrices2 } from '@/hooks/markets2'
import { formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import { isFailedClose } from '@/utils/positionUtils'

import { RealizedAccumulationsTooltip } from '../components'
import { usePnl2, usePositionManagerCopy, useStyles } from '../hooks'

export const StatusLight = styled.div<{ color: string; glow: boolean }>`
  height: 6px;
  width: 6px;
  border-radius: 50%;
  background-color: ${(p) => p.color};
  box-shadow: ${(p) => (p.glow ? `0 0 6px ${p.color}` : 'none')};
`

export const LeverageBadge = ({ leverage }: { leverage: string | number }) => {
  const intl = useIntl()
  const leverageMsg = intl.formatMessage({ defaultMessage: '{leverage}x' }, { leverage })

  return (
    <Badge>
      <Text fontSize="13px">{leverageMsg}</Text>
    </Badge>
  )
}

export const LeftContainer = styled(Flex)<{ borderColor: string }>`
  display: none;

  @media (min-width: ${breakpoints.mdd}) {
    display: flex;
    border-right: 1px solid ${(p) => p.borderColor};
    width: 50%;
  }
`

export const RightContainer = styled(Flex)`
  flex-direction: column;
  width: 100%;
  padding: 15px 24px 30px 24px;
  flex: 1;
  @media (min-width: ${breakpoints.mdd}) {
    width: 50%;
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
  showSocializationWarning?: boolean
}

export const ActivePositionDetail = ({
  label,
  value,
  valueColor,
  valueSubheader,
  showSocializationWarning,
  ...props
}: ActivePositionDetailProps) => {
  const { subheaderTextColor, alpha90, purple } = useStyles()
  const copy = usePositionManagerCopy()
  return (
    <Flex
      flexDirection="column"
      justifyContent="space-between"
      p={'14px'}
      {...props}
      height="100%"
      overflowY="auto"
      // maxHeight="138px"
    >
      <Text fontSize="13px" color={alpha90}>
        {label}
      </Text>
      <Flex flexDirection="column">
        <Box fontSize={{ lg: '26px', base: '18px' }} color={valueColor ? valueColor : 'initial'}>
          {value}
        </Box>
        <Box fontSize="13px" color={subheaderTextColor}>
          {valueSubheader}
        </Box>
        {showSocializationWarning && (
          <Flex alignItems="center" mt={2}>
            <NoticeTooltip
              tooltipText={<SocializationNotice />}
              tooltipProps={{ bg: 'none', p: 0, border: 'none' }}
              mr={2}
            />
            <Text color={purple}>{copy.temporarilyLower}</Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

export const ResponsiveContainer = styled(Flex)`
  height: 100%;
  flex-direction: column;

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

export const PnlPositionDetail = ({ asDataRow }: { asDataRow?: boolean }) => {
  const copy = usePositionManagerCopy()
  const { userCurrentPosition, selectedMarketSnapshot2 } = useMarketContext()
  const livePrices = useChainLivePrices2()
  const failedClose = isFailedClose(userCurrentPosition)
  const pnlData = usePnl2(userCurrentPosition, selectedMarketSnapshot2, livePrices, failedClose)

  const pnlNotional = formatBig6USDPrice(pnlData?.livePnl ?? 0n)
  const pnlPercentage = formatBig6Percent(pnlData?.livePnlPercent ?? 0n)
  const isPnlPositive = pnlData ? pnlData.livePnl >= 0n : true
  const { red, green } = useStyles()
  const pnlTextColor = isPnlPositive ? green : red

  const notionalNode = pnlData ? (
    <RealizedAccumulationsTooltip
      side={userCurrentPosition?.side || PositionSide2.none}
      values={pnlData.data.accumulatedPnl}
      fees={pnlData.totalFees}
      unrealized={pnlData.liveUnrealized}
    >
      <Box fontSize={asDataRow ? '14px' : { lg: '26px', base: '18px' }}>{pnlNotional}</Box>
    </RealizedAccumulationsTooltip>
  ) : (
    <Box fontSize={asDataRow ? '14px' : { lg: '26px', base: '18px' }}>{pnlNotional}</Box>
  )

  if (asDataRow) {
    return (
      <DataRow
        label={copy.pnl}
        value={
          <Flex alignItems="center" color={pnlTextColor}>
            {notionalNode} {/*eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
            <Box mx={1}>/</Box>
            <Box fontSize="14px" color={pnlTextColor}>
              {pnlPercentage}
            </Box>
          </Flex>
        }
      />
    )
  }

  return (
    <ActivePositionDetail
      label={copy.pnl}
      value={notionalNode}
      valueSubheader={pnlPercentage}
      valueColor={pnlTextColor}
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

export const AverageEntryRow = ({ hasPosition }: { hasPosition: boolean }) => {
  const copy = usePositionManagerCopy()
  const { userCurrentPosition } = useMarketContext()
  const { alpha75 } = useStyles()
  const pnlData = usePnl2(userCurrentPosition)

  return (
    <DataRow
      label={copy.averageEntry}
      value={
        <Text fontSize="14px" color={alpha75}>
          {hasPosition ? pnlData?.averageEntryPriceFormatted : copy.noValue}
        </Text>
      }
    />
  )
}
