import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'

import { CurrentSTIPSeason, STIPDropParams, STIPSeasonNumber } from '@/constants/stipDrop'
import { formatBig6USDPrice } from '@/utils/big6Utils'

export const useRewardsCopy = () => {
  const intl = useIntl()
  return {
    season: intl.formatMessage({ defaultMessage: 'Season' }),
    begins: intl.formatMessage({ defaultMessage: 'Begins' }),
    ends: intl.formatMessage({ defaultMessage: 'Ends' }),
    distribution: intl.formatMessage({ defaultMessage: 'Distribution' }),
    traders: intl.formatMessage({ defaultMessage: 'Traders' }),
    taker: intl.formatMessage({ defaultMessage: 'Taker' }),
    rewards: intl.formatMessage({ defaultMessage: 'Rewards' }),
    yourRewards: intl.formatMessage({ defaultMessage: 'Your Rewards' }),
    maker: intl.formatMessage({ defaultMessage: 'Maker' }),
    aboutRewards: intl.formatMessage({ defaultMessage: 'About Rewards' }),
    claimYourRewards: intl.formatMessage({ defaultMessage: 'Claim Your Rewards for trading on Perennial.' }),
    tradeMore: intl.formatMessage({
      defaultMessage: 'Trade more volume on Perennial in order to unlock this reward.',
    }),
    takerRewardsMetrics: intl.formatMessage({
      defaultMessage:
        'Takers can earn a share of ARB rewards by actively trading & maintaining positions on any Perennial markets throughout the week.',
    }),
    makerRewardsMetrics: intl.formatMessage({
      defaultMessage:
        'Makers can earn a share of ARB rewards by providing liquidity to Perennial vaults and/or directly to the protocol as a pro maker. For Maker rewards, vaults/markets will have uneven levels of rewards.',
    }),
    yourVolume: intl.formatMessage({ defaultMessage: 'Volume' }),
    yourFeesPaid: intl.formatMessage({ defaultMessage: 'Fees Paid' }),
    yourCurrentOI: intl.formatMessage({ defaultMessage: 'Current OI' }),
    yourVaultLiquidity: intl.formatMessage({ defaultMessage: 'Vault Liquidity' }),
    yourProMakerLiquidity: intl.formatMessage({ defaultMessage: 'Pro Maker Liquidity' }),
    currentProMakerLeverage: intl.formatMessage({ defaultMessage: 'Pro Maker Leverage' }),
    decreaseSeason: intl.formatMessage({ defaultMessage: 'Decrease Season' }),
    increaseSeason: intl.formatMessage({ defaultMessage: 'Increase Season' }),
    claimAll: intl.formatMessage({ defaultMessage: 'Claim All' }),
    claimedRewards: intl.formatMessage({ defaultMessage: 'ARB Rewards Claim' }),
    takerRewards: intl.formatMessage({ defaultMessage: 'Taker Rewards' }),
    makerRewards: intl.formatMessage({ defaultMessage: 'Maker Rewards' }),
    claimableRewards: intl.formatMessage({ defaultMessage: 'Claimable Rewards' }),
    introducingRewards: intl.formatMessage({ defaultMessage: 'Introducing Rewards' }),
    ariaClose: intl.formatMessage({ defaultMessage: 'Close' }),
    introModalBody: intl.formatMessage({
      defaultMessage:
        'Start placing trades now to earn Arbitrum rewards on Perennial. These rewards are available for a limited time.',
    }),
    startTrading: intl.formatMessage({ defaultMessage: 'Start Trading' }),
    viewRewards: intl.formatMessage({ defaultMessage: 'View Rewards' }),
    earn: intl.formatMessage({ defaultMessage: 'Earn' }),
    arbitrum: intl.formatMessage({ defaultMessage: 'Arbitrum' }),
    forTrading: intl.formatMessage({ defaultMessage: 'for vault deposits & trades' }),
    earnedRewards: intl.formatMessage({ defaultMessage: 'Earned Rewards' }),
    earnedRewardsBody: intl.formatMessage({
      defaultMessage:
        'You have earned rewards for trading. You can now claim these rewards from the Rewards tab. They will not expire.',
    }),
    goToRewards: intl.formatMessage({ defaultMessage: 'Go to Rewards' }),
    continueTrading: intl.formatMessage({ defaultMessage: 'Continue Trading' }),
    arbitrumRewards: intl.formatMessage({ defaultMessage: 'Arbitrum Rewards' }),
    learnMore: intl.formatMessage({ defaultMessage: 'Learn More' }),
    noneToClaim: intl.formatMessage({ defaultMessage: 'None to Claim' }),
    notClaimableYet: intl.formatMessage({ defaultMessage: 'Not Claimable Yet' }),
    pending: intl.formatMessage({ defaultMessage: 'Pending' }),
    feeRebates: intl.formatMessage({ defaultMessage: 'Fee Rebates' }),
    pnlCompetition: intl.formatMessage({ defaultMessage: 'Season Top PNL' }),
    volCompetition: intl.formatMessage({ defaultMessage: 'Season Top Volume' }),
    positionAPRCalc: (estimatedOI: bigint) =>
      intl.formatMessage(
        { defaultMessage: '*Position APR calculated assuming {estimatedOI} open interest for the season' },
        { estimatedOI: formatBig6USDPrice(estimatedOI, { compact: true }) },
      ),
    oiRewardsApr: intl.formatMessage({ defaultMessage: 'Est. OI Rewards APR' }),
    untilReady: (duration: string) => intl.formatMessage({ defaultMessage: '{duration} season ends' }, { duration }),
    seasonHasEnded: intl.formatMessage({ defaultMessage: 'Season has ended' }),
    yourStats: intl.formatMessage({ defaultMessage: 'Your Stats' }),
    upTo: (amount: string) => intl.formatMessage({ defaultMessage: 'Up to {amount}' }, { amount }),
    arbAPR: intl.formatMessage({ defaultMessage: 'Est. ARB Rewards APR' }),
    noValue: intl.formatMessage({ defaultMessage: '--' }),
    totalTakerRewards: intl.formatMessage({ defaultMessage: 'Total Taker Rewards' }),
    totalMakerRewards: intl.formatMessage({ defaultMessage: 'Total Maker Rewards' }),
    timeWeightedOI: intl.formatMessage({ defaultMessage: 'Time-weighted Open Interest' }),
    vaultLPs: intl.formatMessage({ defaultMessage: 'Vault LPs' }),
    blueChipVault: intl.formatMessage({ defaultMessage: 'Blue Chip Vault' }),
    largeCapVault: intl.formatMessage({ defaultMessage: 'Large Cap Vault' }),
    proMakers: intl.formatMessage({ defaultMessage: 'Pro Makers' }),
    ethbtc: intl.formatMessage({ defaultMessage: 'ETH/BTC' }),
    solMatic: intl.formatMessage({ defaultMessage: 'SOL/MATIC' }),
    other: intl.formatMessage({ defaultMessage: 'Other' }),
    rewardsEta: intl.formatMessage({
      defaultMessage: 'Rewards are estimated to be claimable Wednesday at 12:00 UTC (48hr after season ends)',
    }),
    sybilDetected: intl.formatMessage({ defaultMessage: 'Rewards Dampened' }),
    sybilExplanation: intl.formatMessage({
      defaultMessage: 'Your address was detected wash trading and rewards have been dampened.',
    }),
    powerUsersChat: intl.formatMessage({ defaultMessage: 'Power Users Chat' }),
    gainAccess: intl.formatMessage({ defaultMessage: 'Gain access to trade alongside the pros.' }),
    locked: intl.formatMessage({ defaultMessage: 'Locked' }),
    clickToJoin: intl.formatMessage({ defaultMessage: 'Click To Join' }),
    rank: intl.formatMessage({ defaultMessage: 'Rank' }),
    pnlUpdateFrequency: intl.formatMessage({ defaultMessage: 'PNL Value and Rank are updated every 3 hours' }),
    volUpdateFrequency: intl.formatMessage({ defaultMessage: 'Volume Rank is updated every 3 hours' }),
  }
}

export const useRewardsActive = (season: STIPSeasonNumber = CurrentSTIPSeason) => {
  const [rewardsActive, setRewardsActive] = useState(false)

  useEffect(() => {
    if (Date.now() > STIPDropParams[season].from.getTime()) {
      setRewardsActive(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return rewardsActive
}
