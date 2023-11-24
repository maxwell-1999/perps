import { useMemo, useState } from 'react'

import colors from '@/components/design-system/theme/colors'
import { ColumnPageContainer } from '@/components/layout/components'
import { PositionSide2 } from '@/constants/markets'
import { CurrentSTIPSeason, STIPDropParams, STIPSeasonNumber } from '@/constants/stipDrop'
import { useAccountARBSeasonData, useMarketSnapshots2 } from '@/hooks/markets2'
import { useAddress } from '@/hooks/network'
import { useClaimRewards, usePnlLeaderboardData, useRewardData, useVolumeLeaderboardData } from '@/hooks/rewards'
import { useVaultSnapshots2 } from '@/hooks/vaults2'
import { sum } from '@/utils/arrayUtils'
import { BigOrZero, formatBig6USDPrice } from '@/utils/big6Utils'

import { useRewardsCopy } from '../hooks'
import { RewardDescription, StatSectionTitle, SybilMessage } from './components'
import { RewardSchedule } from './components/RewardsSchedule'
import { StatsSection } from './components/StatsSection'

export default function ClaimContainer() {
  const copy = useRewardsCopy()
  const { address } = useAddress()
  const [season, setSeason] = useState<STIPSeasonNumber>(CurrentSTIPSeason)
  const { data: marketSnapshots } = useMarketSnapshots2()
  const { data: vaultSnapshots } = useVaultSnapshots2()
  const { data: rewards } = useAccountARBSeasonData(season)
  const allSeasonData = useRewardData()
  const { data: pnlLeaderboardData } = usePnlLeaderboardData({
    address,
    season,
    enabled: STIPDropParams[season].taker.totalPnlRewards !== 0n,
  })

  const { data: volumeLeaderboardData } = useVolumeLeaderboardData({
    address,
    season,
    enabled: STIPDropParams[season].taker.totalVolumeRewards !== 0n,
  })

  const { data: rewardClaimData } = allSeasonData.find(({ data }) => data?.season === season) ?? {
    rewardClaimData: undefined,
  }
  const previousClaimable = useMemo(() => {
    if (!allSeasonData) return false
    return allSeasonData
      .filter(({ data }) => data?.season && data.season < season)
      .some(({ data }) => !data?.claimed && BigOrZero(data?.amount) > 0n)
  }, [allSeasonData, season])
  const { claimRewards } = useClaimRewards()
  const sybilDetected = address && STIPDropParams[season].sybils.includes(address)

  const takerRewards = rewardClaimData?.userRewards.taker ?? 0n
  console.log(`index-rewardClaimData: `, rewardClaimData)
  const feesRewards = rewardClaimData?.userRewards.fee ?? 0n
  const makerRewards = rewardClaimData?.userRewards.maker ?? 0n
  const vaultRewards = rewardClaimData?.userRewards.vault ?? 0n
  const totalRewards = rewardClaimData?.amount ?? 0n

  const seasonVolume = volumeLeaderboardData?.account?.account ? BigInt(volumeLeaderboardData.account.amount) : 0n
  const seasonVolumeRank = volumeLeaderboardData?.account?.rank ? `#${volumeLeaderboardData.account.rank}` : '--'

  const seasonPnl = pnlLeaderboardData?.account?.account ? BigInt(pnlLeaderboardData.account.amount) : 0n
  const isPnlPositive = seasonPnl >= 0n
  const pnlRank = pnlLeaderboardData?.account?.rank ? `#${pnlLeaderboardData.account.rank}` : '--'

  const takerStats = useMemo(() => {
    const currentOI = marketSnapshots?.user
      ? sum(
          Object.values(marketSnapshots.user).map((ss) => (ss.nextSide === PositionSide2.maker ? 0n : ss.nextNotional)),
        )
      : 0n
    console.log(`index-currentOI: `, currentOI)
    const stats: { label: string; value: string; valueColor?: string; rank?: string; tooltip?: string }[] = [
      { label: 'Fees Paid', value: formatBig6USDPrice(rewards?.fees ?? 0n, { compact: true }) },
    ]
    if (!STIPDropParams[season].over)
      stats.push({ label: 'Open Interest', value: formatBig6USDPrice(currentOI, { compact: true }) })

    if (STIPDropParams[season].taker.totalPnlRewards > 0n) {
      stats.push({
        label: 'PNL',
        value: formatBig6USDPrice(seasonPnl, { compact: true }),
        valueColor: isPnlPositive ? colors.brand.green : colors.brand.red,
        rank: pnlRank,
        tooltip: copy.pnlUpdateFrequency,
      })
    }
    if (STIPDropParams[season].taker.totalVolumeRewards > 0n) {
      stats.push({
        label: 'Volume',
        value: formatBig6USDPrice(seasonVolume, { compact: true }),
        rank: seasonVolumeRank,
        tooltip: copy.volUpdateFrequency,
      })
    } else {
      stats.push({ label: 'Volume', value: formatBig6USDPrice(rewards?.volume ?? 0n, { compact: true }) })
    }

    return stats
  }, [
    marketSnapshots?.user,
    rewards?.fees,
    rewards?.volume,
    season,
    seasonPnl,
    isPnlPositive,
    pnlRank,
    copy,
    seasonVolume,
    seasonVolumeRank,
  ])

  const makerStats = useMemo(() => {
    const vaultOI = vaultSnapshots?.user ? sum(Object.values(vaultSnapshots.user).map((ss) => ss.assets)) : 0n
    const makerOI = marketSnapshots?.user
      ? sum(
          Object.values(marketSnapshots.user).map((ss) => (ss.nextSide !== PositionSide2.maker ? 0n : ss.nextNotional)),
        )
      : 0n

    return [
      {
        label: 'Vault Liquidity',
        value: formatBig6USDPrice(vaultOI, { compact: true }),
      },
      {
        label: 'Pro Maker Liquidity',
        value: formatBig6USDPrice(makerOI, { compact: true }),
      },
    ]
  }, [marketSnapshots?.user, vaultSnapshots?.user])

  const takerRewardBreakdown = useMemo(() => {
    const base = [
      { label: 'Fee Rebates', value: feesRewards },
      { label: 'Open Interest', value: takerRewards },
    ]
    if (STIPDropParams[season].taker.totalPnlRewards > 0n) {
      base.push({ label: 'Top PNL', value: STIPDropParams[season].taker.totalPnlRewards })
    }
    if (STIPDropParams[season].taker.totalVolumeRewards > 0n) {
      base.push({ label: 'Top Volume', value: STIPDropParams[season].taker.totalVolumeRewards })
    }

    return base
  }, [feesRewards, season, takerRewards])

  const onClaim = () => {
    if (!rewardClaimData) return
    claimRewards({ ...rewardClaimData })
  }

  return (
    <ColumnPageContainer>
      <RewardSchedule
        onChangeSeason={setSeason}
        season={season}
        currentSeason={CurrentSTIPSeason}
        onClaim={onClaim}
        rewards={rewardClaimData?.claimed ? 0n : totalRewards}
        previousClaimable={previousClaimable}
      />
      {sybilDetected && <SybilMessage />}
      <StatsSection
        title={<StatSectionTitle title={copy.taker} />}
        sectionHeader={copy.aboutRewards}
        description={<RewardDescription season={season} />}
        stats={takerStats}
        rewards={takerRewards + feesRewards}
        iconText={copy.takerRewards}
        rewardBreakdown={takerRewardBreakdown}
        season={season}
      />
      {/* <StatsSection
        title={<StatSectionTitle title={copy.maker} />}
        sectionHeader={copy.aboutRewards}
        description={<RewardDescription isMaker season={season} />}
        stats={makerStats}
        rewards={makerRewards + vaultRewards}
        iconText={copy.makerRewards}
        rewardBreakdown={[
          { label: 'Vaults', value: vaultRewards },
          { label: 'Pro Maker', value: makerRewards },
        ]}
        season={season}
      /> */}
    </ColumnPageContainer>
  )
}
