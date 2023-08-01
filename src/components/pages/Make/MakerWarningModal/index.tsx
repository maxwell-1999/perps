import { Flex, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { useIntl } from 'react-intl'

import { Button } from '@ds/Button'

interface MakerWarningModalProps {
  onClose: () => void
}

export default function MakerWarningModal({ onClose }: MakerWarningModalProps) {
  const intl = useIntl()

  const hasSeenModal = localStorage.getItem('maker-warning-modal')

  if (hasSeenModal) {
    return null
  }

  const title = intl.formatMessage({
    defaultMessage: 'Advanced LP Interface',
  })
  const bodyCopy = intl.formatMessage({
    defaultMessage:
      "This UI is for Advanced liquidity providers only. Please review Perennial's documentation to understand the risks.",
  })
  const subTitle = intl.formatMessage({
    defaultMessage: 'WARNING',
  })
  const advancedLiquidityProvisioning = intl.formatMessage({
    defaultMessage: 'Advanced Liquidity Provisioning',
  })
  const riskManagement = intl.formatMessage({
    defaultMessage: 'Risk Management',
  })
  const textWithLink = intl.formatMessage(
    {
      defaultMessage: 'See: {advancedLiquidityProvisioning} & {riskManagement}.',
    },
    {
      advancedLiquidityProvisioning: (
        <Link href="https://docs.perennial.finance/lps-makers/advanced-liquidity-provisioning" target="_blank">
          <Text as="span" textDecoration="underline">
            {advancedLiquidityProvisioning}
          </Text>
        </Link>
      ),
      riskManagement: (
        <Link href="https://docs.perennial.finance/lps-makers/risk-management" target="_blank">
          <Text as="span" textDecoration="underline">
            {riskManagement}
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
          <Flex flexDirection="column" gap="14px">
            <Text fontSize="22px">{title}</Text>
            <Text fontWeight="bold">{subTitle}</Text>
            <Text>{bodyCopy}</Text>
            <Text>{textWithLink}</Text>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button
            width="100%"
            label={buttonText}
            onClick={() => {
              localStorage.setItem('maker-warning-modal', 'true')
              onClose()
            }}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
