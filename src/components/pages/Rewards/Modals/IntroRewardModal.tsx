import { Flex, Modal, ModalCloseButton, ModalContent, ModalOverlay, Text } from '@chakra-ui/react'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { Button } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import { AssetMetadata, SupportedAsset } from '@/constants/markets'

import { useRewardsCopy } from '../hooks'

const IntroRewardModal = ({ onClose }: { onClose: () => void }) => {
  const arbMetadata = AssetMetadata[SupportedAsset.arb]
  const router = useRouter()
  const copy = useRewardsCopy()

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
              {copy.introducingRewards}
            </Text>
            <ModalCloseButton />
          </Flex>
          <Flex p={5} pb={2} flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
            <Flex justifyContent="space-between" width="100%" alignItems="center">
              <Flex flexDirection="column">
                <Text fontSize="23px" fontWeight="semibold">
                  <Text as="span" mr={2} color={colors.brand.green} fontWeight="semibold">
                    {copy.earn}
                  </Text>
                  {copy.arbitrum}
                </Text>
                <Text color={colors.brand.whiteAlpha[75]}>{copy.forTrading}</Text>
              </Flex>
              <Image src={arbMetadata.icon} alt={'arbitrum logo'} height={46} width={46} />
            </Flex>
            <Text fontSize="14px" color={colors.brand.whiteAlpha[50]} mb={2}>
              {copy.introModalBody}
            </Text>
            <Flex flexDirection="column" width="100%">
              <Button label={copy.startTrading} mb={0} onClick={onClose} />
              <Button
                label={copy.viewRewards}
                variant="text"
                mb={0}
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/rewards')
                }}
              />
            </Flex>
          </Flex>
        </Flex>
      </ModalContent>
    </Modal>
  )
}

export default IntroRewardModal
