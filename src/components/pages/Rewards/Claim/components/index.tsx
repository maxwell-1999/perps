import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { Box, BoxProps, Flex, FlexProps, Text } from '@chakra-ui/react'
import { intervalToDuration } from 'date-fns'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { Container, DataRow, IconButton } from '@/components/design-system'
import { TooltipIcon } from '@/components/design-system/Tooltip'
import colors from '@/components/design-system/theme/colors'
import { SupportedAsset } from '@/constants/markets'
import { STIPDropParams, STIPSeasonNumber } from '@/constants/stipDrop'
import { formatBig6 } from '@/utils/big6Utils'
import { formatBig18 } from '@/utils/big18Utils'

import { useRewardsCopy } from '../../hooks'

export const PageHeader = ({
  onChangeSeason,
  season,
  currentSeason,
}: {
  onChangeSeason: (season: number) => void
  season: number
  currentSeason: number
}) => {
  const copy = useRewardsCopy()
  return (
    <Flex alignItems="center" justifyContent="space-between" width="100%">
      <Text fontSize="26px">{copy.rewards}</Text>
      <Flex gap={3} alignItems="center" minWidth="220px" justifyContent="space-between">
        <IconButton
          aria-label={copy.decreaseSeason}
          icon={<ArrowBackIcon />}
          isDisabled={season === 1}
          onClick={() => {
            onChangeSeason(season - 1)
          }}
        />
        <Flex width="115px" justifyContent="center">
          <Text fontSize="20px" color={colors.brand.whiteAlpha[50]}>
            {copy.season}
            <Text as="span" color="white" ml={2}>
              {season}
            </Text>
          </Text>
        </Flex>
        <IconButton
          aria-label={copy.increaseSeason}
          icon={<ArrowForwardIcon />}
          isDisabled={season === currentSeason}
          onClick={() => {
            onChangeSeason(season + 1)
          }}
        />
      </Flex>
    </Flex>
  )
}

export const StatSectionTitle = ({ title }: { title: string }) => {
  const copy = useRewardsCopy()
  return (
    <Text fontSize="26px">
      {title}
      <Text color={colors.brand.whiteAlpha[50]} as="span" ml={2}>
        {copy.rewards}
      </Text>
    </Text>
  )
}

export const RewardDescription = ({ season, isMaker }: { season: STIPSeasonNumber; isMaker?: boolean }) => {
  const copy = useRewardsCopy()
  const rewardData = STIPDropParams[season]

  const { lpRewardsAmount, proMakerRewardsAmount, totalMakerRewards, totalTakerRewards } = useMemo(() => {
    const lpRewardsAmount = rewardData.vault.totalOIRewards
    const proMakerRewardsAmount = rewardData.maker.totalOIRewards
    const totalTakerRewards =
      rewardData.taker.totalOIRewards +
      rewardData.taker.totalFeeRewards +
      rewardData.taker.totalPnlRewards +
      rewardData.taker.totalVolumeRewards
    const totalMakerRewards = lpRewardsAmount + proMakerRewardsAmount

    return {
      lpRewardsAmount,
      proMakerRewardsAmount,
      totalMakerRewards,
      totalTakerRewards,
    }
  }, [rewardData])

  const lpRewards = `${formatBig6(lpRewardsAmount)} ARB`
  const proMaker = `${formatBig6(proMakerRewardsAmount)} ARB`

  return (
    <Flex flexDirection="column" gap={3}>
      <Text>{isMaker ? copy.makerRewardsMetrics : copy.takerRewardsMetrics}</Text>
      <Flex flexDirection="column" maxWidth={{ base: '100%', lg: '400px' }}>
        {isMaker ? (
          <DataRow
            label={
              <Text fontSize="14px" color={colors.brand.blueAlpha[100]}>
                {copy.totalMakerRewards}
              </Text>
            }
            value={`${formatBig6(totalMakerRewards)}  ARB`}
            size="md"
          />
        ) : (
          <DataRow
            label={
              <Text fontSize="14px" color={colors.brand.blueAlpha[100]}>
                {copy.totalTakerRewards}
              </Text>
            }
            value={`${formatBig6(totalTakerRewards)} ARB`}
            size="md"
          />
        )}
        <Flex
          flexDirection="column"
          borderRadius="6px"
          border={`1px solid ${colors.brand.blueAlpha[100]}`}
          bg={colors.brand.blueAlpha[16]}
          p={2}
          width="100%"
          gap={1}
        >
          {isMaker ? (
            <>
              <DataRow
                label={copy.vaultLPs}
                mb={0}
                value={
                  <Flex alignItems="center" gap={1}>
                    <Text fontSize="13px">{lpRewards}</Text>
                    {rewardData.vault.tooltip}
                  </Flex>
                }
              />
              <DataRow
                label={copy.proMakers}
                mb={0}
                value={
                  <Flex alignItems="center" gap={1}>
                    <Text fontSize="13px">{proMaker}</Text>
                    {rewardData.maker.tooltip}
                  </Flex>
                }
              />
            </>
          ) : (
            <>
              <DataRow
                label={copy.timeWeightedOI}
                mb={0}
                value={
                  <Flex alignItems="center" gap={1}>
                    {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                    <Text fontSize="13px">{formatBig6(rewardData.taker.totalOIRewards)} ARB</Text>
                    {rewardData.taker.tooltip}
                  </Flex>
                }
              />
              <DataRow
                label={copy.feeRebates}
                mb={0}
                value={
                  <Flex alignItems="center" gap={1}>
                    {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                    <Text fontSize="13px">{formatBig6(rewardData.taker.totalFeeRewards)} ARB</Text>
                    {rewardData.taker.feeTooltip}
                  </Flex>
                }
              />
              {rewardData.taker.totalPnlRewards && (
                <DataRow
                  label={copy.pnlCompetition}
                  mb={0}
                  value={
                    <Flex alignItems="center" gap={1}>
                      {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                      <Text fontSize="13px">{formatBig6(rewardData.taker.totalPnlRewards)} ARB</Text>
                      {rewardData.taker.leaderboardPnlTooltip}
                    </Flex>
                  }
                />
              )}
              {rewardData.taker.totalVolumeRewards && (
                <DataRow
                  label={copy.volCompetition}
                  mb={0}
                  value={
                    <Flex alignItems="center" gap={1}>
                      {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                      <Text fontSize="13px">{formatBig6(rewardData.taker.totalVolumeRewards)} ARB</Text>
                      {rewardData.taker.leaderboardVolumeTooltip}
                    </Flex>
                  }
                />
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

export const SybilMessage = (props: FlexProps) => {
  const copy = useRewardsCopy()

  return (
    <Container borderColor={colors.brand.red} {...props}>
      <Flex flexDirection="column" p={2} gap={2}>
        <Text>{copy.sybilDetected}</Text>
        <Text fontSize="14px" color={colors.brand.whiteAlpha[50]}>
          {copy.sybilExplanation}
        </Text>
      </Flex>
    </Container>
  )
}

export const VerticalStat = ({
  title,
  value,
  rank,
  postValue,
  smallTitle,
  color,
  tooltip,
  ...props
}: {
  title: string
  value: string
  postValue?: string
  smallTitle?: boolean
  rank?: string
  color?: string
  tooltip?: string
} & FlexProps) => {
  const copy = useRewardsCopy()
  return (
    <Flex flexDirection="column" justifyContent="space-between" {...props}>
      <Text
        fontSize={smallTitle ? '14px' : '20px'}
        color={colors.brand.whiteAlpha[50]}
        mb={2}
        className="flex items-center gap-2"
      >
        {title}
        {tooltip && <span className='mt-2'>
          <TooltipIcon tooltipProps={{className:'!ml-2 !mt-2'}} tooltipText={tooltip} />
        </span>}
      </Text>
      <Flex gap={2}>
        <Text fontSize="30px" color={color}>
          {value}
        </Text>
        {postValue && (
          <Text fontSize="30px" color={colors.brand.whiteAlpha[50]}>
            {postValue}
          </Text>
        )}
      </Flex>
      {rank && (
        <Link href="/leaderboard">
          <Text color={colors.brand.purple[240]} fontSize="12px" _hover={{ textDecoration: 'underline' }}>
            {copy.rank}
            <Text as="span" color={colors.brand.whiteAlpha[90]} ml={1}>
              {rank}
            </Text>
          </Text>
        </Link>
      )}
    </Flex>
  )
}

export const Divider = (props: BoxProps) => (
  <Box
    height={{ base: '1px', lg: '100%' }}
    width={{ base: '100%', lg: '1px' }}
    bg={colors.brand.whiteAlpha[10]}
    {...props}
  />
)

export const RewardValue = ({ value }: { value: bigint }) => {
  const copy = useRewardsCopy()
  return (
    <Flex gap={2} alignItems="center">
      {value > 0n ? (
        <Text fontSize="23px">{formatBig18(value)}</Text>
      ) : (
        <Text fontSize="23px" color={colors.brand.whiteAlpha[50]}>
          {copy.noValue}
        </Text>
      )}
      <Text fontSize="14px" fontWeight={500} color={colors.brand.whiteAlpha[50]}>
        {SupportedAsset.arb.toUpperCase()}
      </Text>
    </Flex>
  )
}

export const CountdownTimer = ({ endDate }: { endDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const copy = useRewardsCopy()

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const duration = intervalToDuration({ start: now, end: endDate })

      if (endDate > now) {
        const formattedDuration = `${duration.days}d, ${duration.hours}h`
        setTimeLeft(copy.untilReady(formattedDuration))
      } else {
        setTimeLeft(copy.seasonHasEnded)
        clearInterval(intervalId)
      }
    }
    updateTimer()
    const intervalId = setInterval(updateTimer, 60000)
    return () => clearInterval(intervalId)
  }, [endDate, copy])

  return (
    <Text fontSize="13px" fontWeight="bold" color={colors.brand.whiteAlpha[50]}>
      {timeLeft}
    </Text>
  )
}
