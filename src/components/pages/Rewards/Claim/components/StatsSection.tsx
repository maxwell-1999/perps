import { Flex, Text } from '@chakra-ui/react'

import { Container, DataRow } from '@/components/design-system'
import { TooltipText } from '@/components/design-system/Tooltip'
import colors from '@/components/design-system/theme/colors'
import { AssetIconWithText } from '@/components/shared/components'
import { AssetMetadata, SupportedAsset } from '@/constants/markets'
import { STIPDropParams, STIPSeasonNumber } from '@/constants/stipDrop'
import { formatBig18 } from '@/utils/big18Utils'

import { CountdownTimer, Divider, RewardValue, VerticalStat } from '.'
import { useRewardsCopy } from '../../hooks'

export const StatsSection = ({
  title,
  sectionHeader,
  description,
  stats,
  rewards,
  iconText,
  rewardBreakdown,
  season,
}: {
  title: React.ReactNode
  sectionHeader: string
  description: React.ReactNode
  stats: { label: string; value: string; rank?: string; valueColor?: string; tooltip?: string }[]
  rewards: bigint
  iconText: string
  rewardBreakdown: { label: string; value: bigint }[]
  season: STIPSeasonNumber
}) => {
  const seasonEnd = STIPDropParams[season].to
  const isPending = seasonEnd.getTime() > Date.now()
  const copy = useRewardsCopy()

  return (
    <Flex flexDirection="column" width="100%">
      <Flex mb={4}>{title}</Flex>
      <Container
        p={6}
        className='!bg-[#282B39]'
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={{ base: 4, lg: 0 }}
        alignItems={{ base: 'initial', lg: 'center' }}
      >
        <Flex flexDirection="column" gap={3} flex={3} pr={{ base: 0, lg: 4 }}>
          <Text fontSize="14px" color={colors.brand.whiteAlpha[50]}>
            {sectionHeader}
          </Text>
          {description}
          <Flex flexDirection="column">
            <Text fontSize="14px" color={colors.brand.purple[240]} mb={2}>
              {copy.yourStats}
            </Text>
            <Flex width="100%" gap={8} display={{ base: 'none', lg: 'flex' }}>
              {stats.map((stat, i) => (
                <Flex key={`label-${i}`}>
                  <VerticalStat
                    title={stat.label}
                    value={stat.value}
                    rank={stat?.rank}
                    color={stat.valueColor}
                    tooltip={stat.tooltip}
                  />
                  {i !== stats.length - 1 && <Divider width="1px" height="100%" ml={8} />}
                </Flex>
              ))}
            </Flex>
            <Container
              p={2}
              gap={1}
              border={`1px solid ${colors.brand.purpleAlpha[100]}`}
              bg={colors.brand.purpleAlpha[16]}
              display={{ base: 'flex', lg: 'none' }}
            >
              {stats.map((stat, i) => (
                <DataRow
                  mb={0}
                  key={`label-${i}`}
                  label={
                    stat.tooltip ? (
                      <TooltipText tooltipText={stat.tooltip} color={colors.brand.whiteAlpha[50]} fontSize="12px">
                        {stat.label}
                      </TooltipText>
                    ) : (
                      stat.label
                    )
                  }
                  value={
                    <Text fontSize="13px" color={stat.valueColor ? stat.valueColor : 'White'}>
                      {stat.value}
                    </Text>
                  }
                  display={{ base: 'flex', lg: 'none' }}
                />
              ))}
            </Container>
          </Flex>
        </Flex>
        <Container
          flexDirection="column"
          justifyContent="space-between"
          borderColor="white"
          minWidth="fit-content"
          height="100%"
          maxHeight="200px"
          p={4}
          flex={1}
          gap={2}
          mt={{ base: 1, lg: 0 }}
        >
          <AssetIconWithText
            market={AssetMetadata[SupportedAsset.arb]}
            text={iconText}
            textProps={{ color: colors.brand.whiteAlpha[50], whiteSpace: 'nowrap' }}
          />
          {isPending ? (
            <Flex flexDirection="column" gap={1}>
              <Text fontSize="23px" fontWeight="500">
                {copy.pending}
              </Text>
              <CountdownTimer endDate={seasonEnd} />
            </Flex>
          ) : (
            <>
              <RewardValue value={rewards} />
              <Flex flexDirection="column">
                {rewardBreakdown.map((stat) => {
                  return (
                    <DataRow
                      label={<Text color={colors.brand.whiteAlpha[50]}>{stat.label}</Text>}
                      value={
                        stat.value > 0n ? (
                          <Text>
                            {formatBig18(stat.value)}
                            <Text as="span" ml={1} fontSize="14px" fontWeight={500} color={colors.brand.whiteAlpha[50]}>
                              {SupportedAsset.arb.toUpperCase()}
                            </Text>
                          </Text>
                        ) : (
                          copy.noValue
                        )
                      }
                      key={stat.label}
                    />
                  )
                })}
              </Flex>
            </>
          )}
        </Container>
      </Container>
    </Flex>
  )
}
