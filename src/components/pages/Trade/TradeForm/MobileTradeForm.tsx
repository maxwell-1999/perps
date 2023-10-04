import { CloseIcon } from '@chakra-ui/icons'
import { Flex, Modal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { IconButton } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'

import TradeForm from './index'

export default function MobileTradeForm() {
  const intl = useIntl()
  const closeAriaLabel = intl.formatMessage({ defaultMessage: 'close-btn' })
  const { mobileTradeFormOpen, setMobileTradeFormOpen, setTradeFormState, formState } = useTradeFormState()
  if (!mobileTradeFormOpen) return null
  return (
    <Modal isOpen onClose={() => setMobileTradeFormOpen(false)} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalBody display="flex" flexDirection="column" gap={2} bg="black">
          <Flex width="100%" justifyContent="flex-end">
            <IconButton
              icon={<CloseIcon color={colors.brand.whiteAlpha[70]} />}
              onClick={() => {
                if (formState !== FormState.trade) {
                  setTradeFormState(FormState.trade)
                }
                setMobileTradeFormOpen(false)
              }}
              aria-label={closeAriaLabel}
              border="none"
              bg="transparent"
            />
          </Flex>
          <TradeForm isMobile={true} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
