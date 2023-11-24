import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { Flex, FlexProps, Text } from '@chakra-ui/react'
import DiscordLogo from '@public/icons/discord.svg'
import { format } from 'date-fns'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button, Container, DataRow, IconButton } from '@/components/design-system'
import { TooltipIcon } from '@/components/design-system/Tooltip'
import colors from '@/components/design-system/theme/colors'
import { TxButton } from '@/components/shared/TxButton'
import { AssetIconWithText } from '@/components/shared/components'
import { AssetMetadata, SupportedAsset } from '@/constants/markets'
import { AllSTIPSeasons, STIPDropParams, STIPSeasonNumber } from '@/constants/stipDrop'
import { useCheckGuildAccess } from '@/hooks/rewards'
import { formatBig6 } from '@/utils/big6Utils'

import { CountdownTimer, RewardValue } from '.'
import { PerennialGuildUrl } from '../../constants'
import { useRewardsCopy } from '../../hooks'

export const RewardSchedule = ({
  onChangeSeason,
  season,
  rewards,
  currentSeason,
  onClaim,
  previousClaimable,
}: {
  onChangeSeason: (season: STIPSeasonNumber) => void
  season: STIPSeasonNumber
  currentSeason: STIPSeasonNumber
  rewards: bigint
  onClaim: () => void
  previousClaimable?: boolean
}) => {
  const copy = useRewardsCopy()
  const seasonParams = STIPDropParams[season]

  return (
    <Flex
      width="100%"
      flexDirection={{ base: 'column', lg: 'row' }}
      gap={{ base: 8, lg: 1 }}
      justifyContent="space-between"
    >
      <Flex flexDirection="column" gap={{ base: 4, lg: 6 }} mb={4} order={{ base: 2, lg: 1 }}>
        <Text fontSize="26px" lineHeight={1}>
          {copy.yourRewards}
        </Text>
        <Text color={colors.brand.whiteAlpha[50]} lineHeight={1}>
          {copy.claimYourRewards}
        </Text>
        <Flex gap={8} flexDirection={{ base: 'column', lg: 'row' }}>
          <ClaimCard rewards={rewards} onClaim={onClaim} selectedSeason={season} currentSeason={currentSeason} />
          <GuildCard />
        </Flex>
      </Flex>
      <Flex flexDirection="column" gap={{ base: 8, lg: 2 }} order={{ base: 1, lg: 2 }} minWidth="300px">
        <SeasonSelector onChangeSeason={onChangeSeason} season={season} previousClaimable={previousClaimable} />
        <Flex
          flexDirection="column"
          borderRadius="6px"
          border={{ base: `1px solid ${colors.brand.whiteAlpha[10]}`, lg: 'none' }}
          py={{ base: 2, lg: 4 }}
        >
          <RewardStat
            title={copy.begins}
            value={format(seasonParams.from, 'P').replace('/2023', '')}
            postValue={format(seasonParams.from, 'ha')}
            borderBottom={`1px solid ${colors.brand.whiteAlpha[10]}`}
          />

          <RewardStat
            title={copy.ends}
            value={format(seasonParams.to, 'P').replace('/2023', '')}
            postValue={format(seasonParams.to, 'ha')}
            borderBottom={`1px solid ${colors.brand.whiteAlpha[10]}`}
          />

          <RewardStat title={copy.distribution} value={formatBig6(seasonParams.totalRewards)} postValue={'ARB'} />
        </Flex>
      </Flex>
    </Flex>
  )
}

const SeasonSelector = ({
  previousClaimable,
  season,
  onChangeSeason,
}: {
  previousClaimable?: boolean
  season: STIPSeasonNumber
  onChangeSeason: (season: STIPSeasonNumber) => void
}) => {
  const copy = useRewardsCopy()

  return (
    <Flex gap={3} alignItems="center" minWidth="220px" justifyContent="space-between">
      <IconButton
        aria-label={copy.decreaseSeason}
        icon={<ArrowBackIcon />}
        showAlert={previousClaimable}
        isDisabled={season <= 1}
        onClick={() => {
          onChangeSeason((season - 1) as STIPSeasonNumber)
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
        isDisabled={season === Math.max(...AllSTIPSeasons)}
        onClick={() => {
          onChangeSeason((season + 1) as STIPSeasonNumber)
        }}
      />
    </Flex>
  )
}

const GuildCard = () => {
  const copy = useRewardsCopy()
  const { data: hasRoleAccess } = useCheckGuildAccess()
  const [isPowerUser, setIsPowerUser] = useState(false)

  useEffect(() => {
    if (hasRoleAccess) {
      setIsPowerUser(true)
    }
  }, [setIsPowerUser, hasRoleAccess])

  return (
    <Container
      bg={colors.brand.purpleAlpha[16]}
      borderColor={colors.brand.purpleAlpha[100]}
      flexDirection="column"
      minWidth="205px"
      p={4}
      flex={1}
      gap={4}
      justifyContent="space-between"
    >
      <Flex flexDirection="column" gap={4}>
        <Flex alignItems="center" gap={2}>
          <DiscordLogo />
          <Text>{copy.powerUsersChat}</Text>
        </Flex>
        <Flex maxWidth={{ base: '100%', lg: '150px' }}>
          <Text color={colors.brand.whiteAlpha[50]}>{copy.gainAccess}</Text>
        </Flex>
      </Flex>
      {!isPowerUser && (
        <Button
          variant="transparent"
          label={copy.locked}
          isDisabled={true}
          rightIcon={<TooltipIcon tooltipText={copy.tradeMore} />}
        />
      )}
      {isPowerUser && (
        <Link href={PerennialGuildUrl} passHref target="_blank">
          <Button label={copy.clickToJoin} variant="transparent" width="100%" />
        </Link>
      )}
    </Container>
  )
}

const RewardStat = ({
  title,
  value,
  postValue,
  ...props
}: { title: string; value: string; postValue?: string } & FlexProps) => {
  return (
    <Flex width="100%" py={3} px={{ base: 3, lg: 0 }} {...props}>
      <DataRow
        width="100%"
        size="lg"
        label={
          <Text fontSize="16px" color={colors.brand.whiteAlpha[50]}>
            {title}
          </Text>
        }
        my={0}
        value={
          <Text fontSize="18px">
            {value}
            {postValue && (
              <Text as="span" color={colors.brand.whiteAlpha[50]} ml={2}>
                {postValue}
              </Text>
            )}
          </Text>
        }
      />
    </Flex>
  )
}

const ClaimCard = ({
  rewards,
  onClaim,
  selectedSeason,
  currentSeason,
  ...props
}: {
  rewards: bigint
  selectedSeason: STIPSeasonNumber
  onClaim: () => void
  currentSeason: STIPSeasonNumber
} & FlexProps) => {
  const copy = useRewardsCopy()
  const hasRewards = rewards > 0n
  const selectedSeasonEnd = STIPDropParams[selectedSeason].to
  const hasRewardsData = !!STIPDropParams[selectedSeason].blobUrl

  const isPending = selectedSeasonEnd.getTime() > Date.now()

  return (
    <Container
      flexDirection="column"
      justifyContent="space-between"
      minWidth="fit-content"
      height="100%"
      bg={colors.brand.blueAlpha[16]}
      borderColor={colors.brand.blueAlpha[100]}
      p={4}
      flex={1}
      gap={4}
      {...props}
    >
      <AssetIconWithText
        market={AssetMetadata[SupportedAsset.arb]}
        text={copy.claimableRewards}
        textProps={{ whiteSpace: 'nowrap' }}
      />
      {selectedSeason === currentSeason - 1 && !hasRewardsData && (
        <Flex maxWidth={{ base: '100%', lg: '200px' }} mb={-3}>
          <Text fontSize="11px" color={colors.brand.whiteAlpha[50]}>
            {copy.rewardsEta}
          </Text>
        </Flex>
      )}
      {isPending ? (
        <Flex flexDirection="column" gap={1}>
          <Flex alignItems="center" gap={2}>
            <Text fontSize="23px" fontWeight="500">
              {copy.pending}
            </Text>
            {selectedSeason === currentSeason && <TooltipIcon tooltipText={copy.rewardsEta} />}
          </Flex>
          <CountdownTimer endDate={selectedSeasonEnd} />
        </Flex>
      ) : (
        <Flex alignItems="center" gap={2}>
          <RewardValue value={rewards} />
          {selectedSeason === currentSeason && <TooltipIcon tooltipText={copy.rewardsEta} />}
        </Flex>
      )}
      <TxButton
        overrideLabel
        skipMarketFactoryApproval
        variant="transparent"
        onClick={onClaim}
        label={isPending ? copy.notClaimableYet : hasRewards ? copy.claimAll : copy.noneToClaim}
        isDisabled={!hasRewards || isPending}
      />
    </Container>
  )
}
