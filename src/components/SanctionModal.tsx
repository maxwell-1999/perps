/* eslint-disable formatjs/no-literal-string-in-jsx */
import { Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react'

const SanctionModal = () => (
  <Modal isOpen isCentered variant="confirmation" onClose={() => {}}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>
        <Text>Application Unavailable</Text>
      </ModalHeader>
      <ModalBody>
        <Text>
          This address is blocked on the Perennial interface. For more details, please see our{' '}
          <Link href="/tos" isExternal textDecoration="underline">
            Terms and Conditions
          </Link>
          .
        </Text>
      </ModalBody>
      <ModalFooter />
    </ModalContent>
  </Modal>
)

export default SanctionModal
