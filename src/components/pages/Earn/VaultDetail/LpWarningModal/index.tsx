import { Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { useIntl } from 'react-intl'

import { useChainId } from '@/hooks/network'

import { Button } from '@ds/Button'

interface LpWarningModalProps {
  onClose: () => void
}

export default function LpWarningModal({ onClose }: LpWarningModalProps) {
  const intl = useIntl()
  const chainId = useChainId()
  const title = intl.formatMessage({
    defaultMessage: 'Provide Liquidity',
  })
  const bodyCopy = intl.formatMessage({
    defaultMessage:
      'Perennial vaults take the opposite side of the net of traders, leading to directional (delta) exposure. Vaults earn funding and fees in exchange for the directional risk they take on, but there is no guarantee against this resulting in net losses.',
  })
  const learnMore = intl.formatMessage({
    defaultMessage: 'Learn more',
  })
  const textWithLink = intl.formatMessage(
    {
      defaultMessage: '{learnMore} about the strategy and risks involved.',
    },
    {
      learnMore: (
        <Link href="https://docs.perennial.finance/lps-makers/vaults" target="_blank">
          <Text as="span" textDecoration="underline">
            {learnMore}
          </Text>
        </Link>
      ),
    },
  )
  const buttonText = intl.formatMessage({
    defaultMessage: 'I Understand',
  })

  return (
    <Modal isOpen onClose={onClose} closeOnOverlayClick={false} isCentered closeOnEsc={false} variant="confirmation">
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Text fontSize="22px" mb="14px">
            {title}
          </Text>
          <Text mb="14px">{bodyCopy}</Text>
          <Text>{textWithLink}</Text>
        </ModalBody>
        <ModalFooter>
          <Button
            width="100%"
            label={buttonText}
            onClick={() => {
              localStorage.setItem(`${chainId}-lpWarning`, 'true')
              onClose()
            }}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
