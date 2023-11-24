import { AddIcon } from '@chakra-ui/icons'
import { Flex, Modal, ModalCloseButton, ModalContent, ModalOverlay, Text } from '@chakra-ui/react'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { Button } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import { FormattedBig6 } from '@/components/shared/components'
import { AssetMetadata, SupportedAsset } from '@/constants/markets'

import { useRewardsCopy } from '../hooks'

const EarnedRewardsModal = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter()
  const arbMetadata = AssetMetadata[SupportedAsset.arb]
  const copy = useRewardsCopy()
  const rewardsEarned = 50000000n

  return (
    <Modal isOpen isCentered onClose={onClose} variant="confirmation">
      <ModalOverlay />
      <ModalContent width="300px">
        <Flex width="100%" flexDirection="column">
          <Flex
            alignItems="center"
            width="100%"
            justifyContent="space-between"
            borderBottom={`1px solid ${colors.brand.whiteAlpha[10]}`}
            py={3}
            px={5}
          >
            <Text fontSize="16px" fontWeight={600}>
              {copy.earnedRewards}
            </Text>
            <ModalCloseButton />
          </Flex>
          <Flex p={5} pb={2} flexDirection="column" justifyContent="center" alignItems="center" gap={4}>
            <Image src={arbMetadata.icon} alt={'arbitrum logo'} height={67} width={67} />
            <Flex alignItems="center" gap={2}>
              <AddIcon color={colors.brand.green} />
              <FormattedBig6 fontSize="23px" fontWeight="semibold" value={rewardsEarned} />
              <Text fontSize="23px" color={colors.brand.whiteAlpha[50]}>
                {arbMetadata.baseCurrency.toUpperCase()}
              </Text>
            </Flex>
            <Text fontSize="14px" color={colors.brand.whiteAlpha[50]} textAlign="center">
              {copy.earnedRewardsBody}
            </Text>
            <Flex flexDirection="column" width="100%">
              <Button
                label={copy.goToRewards}
                width="100%"
                mb={0}
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/rewards')
                }}
              />
              <Button label={copy.continueTrading} variant="text" width="100%" mb={0} />
            </Flex>
          </Flex>
        </Flex>
      </ModalContent>
    </Modal>
  )
}

export default EarnedRewardsModal
