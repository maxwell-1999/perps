import {
  ButtonGroup,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { OpenPositionType } from '@/constants/markets'

import { Button } from '@ds/Button'

import { useTradeFormCopy } from '../../hooks'
import { Adjustment, Callbacks } from './constants'
import { useSteps } from './hooks'

interface AdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onCancel: () => void
  title: string
  adjustment: Adjustment
  callbacks: Callbacks
  positionType: OpenPositionType
}

function AdjustPositionModal({
  isOpen,
  onClose,
  title,
  onCancel,
  adjustment,
  callbacks,
  positionType,
}: AdjustmentModalProps) {
  const copy = useTradeFormCopy()
  const [currStep, setCurrStep] = useState(0)
  const [currIsLoading, setCurrIsLoading] = useState(false)
  const steps = useSteps(adjustment, callbacks, currStep, positionType, currIsLoading)

  const onButtonClick = async (callback: () => Promise<void>) => {
    setCurrIsLoading(true)

    try {
      await callback()
    } catch (e) {
      // error submitting tx, including if user rejects the tx
      setCurrIsLoading(false)
      return
    }
    setCurrStep(currStep + 1)
    setCurrIsLoading(false)
  }

  useEffect(() => {
    if (currStep >= steps.length) {
      onClose()
    }
  }, [steps, currStep, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {steps.map(({ step, onClick, label, description }, i) => (
            <Flex key={step}>
              {steps.length > 1 && (
                <Text fontWeight="bold">
                  {i + 1}. {label}
                </Text>
              )}
              <Button
                disabled={currStep !== i || currIsLoading}
                onClick={() => onButtonClick(onClick)}
                label={currStep === i && currIsLoading ? <Spinner size="sm" /> : <span>{description}</span>}
              />
            </Flex>
          ))}
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="secondary" onClick={onCancel} label={copy.cancel} mr={1} />
            <Button onClick={steps[currStep].onClick} label={copy.openPosition} />
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AdjustPositionModal
