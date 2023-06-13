/* eslint-disable formatjs/no-literal-string-in-jsx */
import {
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'

import { Button } from './design-system'

interface ToSModalProps {
  onAccept: () => void
  onDecline: () => void
}

const ToSModal = ({ onAccept, onDecline }: ToSModalProps) => (
  <Modal isOpen isCentered onClose={onDecline} variant="confirmation">
    <ModalOverlay />
    <ModalContent>
      <ModalCloseButton />
      <ModalHeader>
        <Text>Terms of Service and Privacy Policy</Text>
      </ModalHeader>
      <ModalBody>
        <Text>
          To continue using Perennial, please accept our{' '}
          <Link href="/tos" isExternal textDecoration="underline">
            Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link href="/privacy" isExternal textDecoration="underline">
            Privacy Policy
          </Link>
          .
        </Text>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onAccept} label="Accept" />
      </ModalFooter>
    </ModalContent>
  </Modal>
)

export default ToSModal
