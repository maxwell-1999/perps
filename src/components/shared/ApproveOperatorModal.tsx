import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalOverlay, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { TransactionReceipt } from 'viem'

import { useOperatorTransactions } from '@/hooks/wallet'

import { Button } from '@ds/Button'

interface ApproveOperatorModalProps {
  onClose: (receipt?: TransactionReceipt) => void
}

export default function ApproveOperatorModal({ onClose }: ApproveOperatorModalProps) {
  const intl = useIntl()
  const [isLoading, setIsLoading] = useState(false)
  const { onApproveMultiInvokerOperator } = useOperatorTransactions()

  const title = intl.formatMessage({
    defaultMessage: 'Approve Operator',
  })

  const bodyCopy = intl.formatMessage({
    defaultMessage:
      "Perennial's Operator contracts require a one-time approval. Approving the operator allows a user to batch multiple actions into one transaction. Approvals can be revoked at any time.",
  })

  const buttonText = intl.formatMessage({
    defaultMessage: 'Approve Operator',
  })

  return (
    <Modal isOpen onClose={onClose} closeOnOverlayClick={false} isCentered closeOnEsc={false} variant="confirmation">
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Text fontSize="22px" mb="14px">
            {title}
          </Text>
          <ModalCloseButton />
          <Text mb="14px">{bodyCopy}</Text>
        </ModalBody>
        <ModalFooter>
          <Button
            width="100%"
            label={buttonText}
            isLoading={isLoading}
            onClick={async () => {
              setIsLoading(true)
              const receipt = await onApproveMultiInvokerOperator()
              onClose(receipt)
            }}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
