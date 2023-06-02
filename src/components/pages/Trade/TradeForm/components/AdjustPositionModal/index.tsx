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
import { useState } from 'react'

import { OpenPositionType } from '@/constants/markets'

import { Button } from '@ds/Button'

import { Adjustment } from './constants'
import { useAdjustmentModalCopy } from './hooks'

interface AdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onCancel: () => void
  title: string
  adjustment: Adjustment
  positionType: OpenPositionType
  onApproveUSDC: () => void
  onModifyPosition: (
    currency: string,
    collateralDelta: bigint,
    positionSide: OpenPositionType,
    positionDelta: bigint,
  ) => Promise<void>
}

function AdjustPositionModal({
  isOpen,
  onClose,
  title,
  onCancel,
  adjustment,
  onApproveUSDC,
  onModifyPosition,
  positionType,
}: AdjustmentModalProps) {
  const copy = useAdjustmentModalCopy()
  const [approveUsdcLoading, setApproveUsdcLoading] = useState(false)
  const [orderTxLoading, setOrderTxLoading] = useState(false)
  const {
    collateral: { difference: collateralDifference, currency, needsApproval },
    position: { difference: positionDifference },
  } = adjustment
  const requiresApproval = collateralDifference > 0n && needsApproval
  const [spendApproved, setSpendApproved] = useState(!requiresApproval)

  const handleApproveUSDC = async () => {
    setApproveUsdcLoading(true)
    try {
      await onApproveUSDC()
      setSpendApproved(true)
    } catch (err) {
      console.error(err)
    } finally {
      setApproveUsdcLoading(false)
    }
  }

  const handleSetOrder = async () => {
    setOrderTxLoading(true)
    try {
      await onModifyPosition(currency, collateralDifference, positionType, positionDifference)
      onClose()
    } catch (err) {
      console.error(err)
      setOrderTxLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" align="center" justify="center" py={8}>
            {requiresApproval && (
              <Flex>
                <Text mr={2}>{copy.approve}</Text>
                <Button
                  isDisabled={spendApproved || approveUsdcLoading}
                  label={approveUsdcLoading ? <Spinner size="sm" /> : copy.approveUSDC}
                  onClick={handleApproveUSDC}
                />
              </Flex>
            )}
            <Flex>
              <Text mr={2}>{copy.placeOrder}</Text>
              <Button
                isDisabled={!spendApproved || orderTxLoading}
                label={orderTxLoading ? <Spinner size="sm" /> : copy.confirm}
                onClick={handleSetOrder}
              />
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="secondary" onClick={onCancel} label={copy.cancel} mr={1} />
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AdjustPositionModal
