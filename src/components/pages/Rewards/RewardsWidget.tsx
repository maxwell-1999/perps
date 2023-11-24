import { Flex, Text } from '@chakra-ui/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { Button, DataRow } from '@/components/design-system'
import { TooltipText } from '@/components/design-system/Tooltip'
import colors from '@/components/design-system/theme/colors'
import { FormattedBig6Percent } from '@/components/shared/components'
import { AssetMetadata, PositionSide2, SupportedAsset } from '@/constants/markets'
import { CurrentSTIPSeason, STIPSeasonNumber } from '@/constants/stipDrop'
import { formatBig6USDPrice } from '@/utils/big6Utils'

import EarnedRewardsModal from './Modals/EarnedRewardsModal'
import IntroRewardModal from './Modals/IntroRewardModal'
import { useRewardsActive, useRewardsCopy } from './hooks'

const RewardsWidget = ({
  showModals,
  pendingReward = 0n,
  pendingAPR = 0n,
  estimatedOI = 0n,
  season = CurrentSTIPSeason,
  hideLearnMore,
}: {
  showModals?: boolean
  pendingReward?: bigint
  pendingAPR?: bigint
  estimatedOI?: bigint
  side: PositionSide2 | 'vault'
  season?: STIPSeasonNumber
  hideLearnMore?: boolean
}) => {
  const copy = useRewardsCopy()
  const router = useRouter()
  const [showEarnedRewardsModal, setShowEarnedRewardsModal] = useState(false)
  const [showIntroRewardModal, setShowIntroRewardModal] = useState(false)
  const showRewardsWidget = useRewardsActive(season)

  useEffect(() => {
    if (!showModals || !showRewardsWidget) return
    const introRewardModalSeen = localStorage.getItem('introRewardModalSeen')
    if (!introRewardModalSeen) {
      setShowIntroRewardModal(true)
      localStorage.setItem('introRewardModalSeen', 'true')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRewardsWidget])

  const arbMetadata = AssetMetadata[SupportedAsset.arb]
  const hasPendingReward = pendingReward > 0n
  const hasPendingAPR = pendingAPR > 0n
  const earnedRewards = 0n
  const hasRewards = earnedRewards > 0n

  if (!showRewardsWidget) return null

  return (
    <>
      {showModals && showEarnedRewardsModal && hasRewards && (
        <EarnedRewardsModal
          onClose={() => {
            setShowEarnedRewardsModal(false)
          }}
        />
      )}
      {showModals && showIntroRewardModal && (
        <IntroRewardModal
          onClose={() => {
            setShowIntroRewardModal(false)
          }}
        />
      )}
      <Flex
        flexDirection="column"
        borderRadius="6px"
        border={`1px solid ${colors.brand.blueAlpha[100]}`}
        bg={colors.brand.blueAlpha[16]}
        p={2}
        width="100%"
      >
        <DataRow
          mb={hasPendingReward || hasPendingAPR ? 2 : 0}
          label={
            <Flex alignItems="center">
              <Image src={arbMetadata.icon} alt={'arbitrum logo'} height={20} width={20} />
              <Text ml={2} fontSize="12px">
                {copy.arbitrumRewards}
              </Text>
            </Flex>
          }
          value={
            hideLearnMore ? (
              ''
            ) : (
              <Button
                p={0}
                height="fit-content"
                variant="text"
                fontSize="12px"
                color={colors.brand.blueAlpha[100]}
                label={copy.learnMore}
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/rewards')
                }}
              />
            )
          }
        />
        {hasPendingReward && (
          <DataRow label={copy.feeRebates} value={copy.upTo(formatBig6USDPrice(pendingReward, { compact: true }))} />
        )}
        {hasPendingAPR && (
          <DataRow
            mb={0}
            label={copy.oiRewardsApr}
            value={
              <TooltipText tooltipText={<Text fontSize="12px">{copy.positionAPRCalc(estimatedOI)}</Text>}>
                <FormattedBig6Percent fontSize="12px" color={colors.brand.green} value={pendingAPR} />
              </TooltipText>
            }
          />
        )}
      </Flex>
    </>
  )
}

export default RewardsWidget
