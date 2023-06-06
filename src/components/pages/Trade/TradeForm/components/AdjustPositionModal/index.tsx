import {
  Box,
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
  useColorModeValue,
} from '@chakra-ui/react'
import RightArrow from '@public/icons/position-change-arrow.svg'
import { useState } from 'react'

import { OpenPositionType } from '@/constants/markets'
import { PositionDetails, useProductTransactions } from '@/hooks/markets'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { IPerennialLens } from '@t/generated/LensAbi'

import { PositionInfo } from './components'
import { useAdjustmentModalCopy } from './hooks'
import { createAdjustment, getPositionChangeValues } from './utils'

interface AdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onCancel: () => void
  title: string
  position?: PositionDetails
  product: IPerennialLens.ProductSnapshotStructOutput
  usdcAllowance: bigint
  orderValues: {
    collateral: string
    amount: string
    leverage: number
  }
  positionType: OpenPositionType
}

function AdjustPositionModal({
  isOpen,
  onClose,
  title,
  onCancel,
  orderValues,
  positionType,
  position,
  product,
  usdcAllowance,
}: AdjustmentModalProps) {
  const copy = useAdjustmentModalCopy()
  const [approveUsdcLoading, setApproveUsdcLoading] = useState(false)
  const [orderTxLoading, setOrderTxLoading] = useState(false)
  const borderColor = useColorModeValue(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])

  const { productAddress } = product
  const { onApproveUSDC, onModifyPosition } = useProductTransactions(productAddress)

  const adjustment = createAdjustment({
    position,
    product,
    orderValues,
    usdcAllowance,
  })

  const {
    collateral: { difference: collateralDifference, needsApproval },
    position: { difference: positionDifference },
  } = adjustment

  const requiresApproval = collateralDifference > 0n && needsApproval
  const [spendApproved, setSpendApproved] = useState(!requiresApproval)

  const { prevPosition, prevCollateral, prevLeverage, newPosition, newCollateral, newLeverage } =
    getPositionChangeValues(adjustment)

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
      await onModifyPosition(collateralDifference, positionType, positionDifference)
      onClose()
    } catch (err) {
      console.error(err)
      setOrderTxLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered variant="confirmation">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" align="center" justify="center" py={2}>
            <Flex flexDirection="column" alignItems="center" mb={3}>
              <Text fontSize="15px" mb={2}>
                {copy.position}
              </Text>
              <Flex
                justifyContent="space-between"
                alignItems="center"
                width="220px"
                borderRadius="5px"
                border={`1px solid ${borderColor}`}
              >
                <PositionInfo position={prevPosition} collateral={prevCollateral} leverage={prevLeverage} isPrevious />
                <Box height="20px" width="20px">
                  <RightArrow />
                </Box>
                <PositionInfo position={newPosition} collateral={newCollateral} leverage={newLeverage} />
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            {(requiresApproval || !spendApproved) && (
              <Button
                isDisabled={spendApproved || approveUsdcLoading}
                label={approveUsdcLoading ? <Spinner size="sm" /> : copy.approveUSDC}
                onClick={handleApproveUSDC}
              />
            )}
            <Button
              isDisabled={!spendApproved || orderTxLoading}
              label={orderTxLoading ? <Spinner size="sm" /> : copy.placeOrder}
              onClick={handleSetOrder}
              minWidth="110px"
            />
            <Button variant="secondary" onClick={onCancel} label={copy.cancel} mr={1} />
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AdjustPositionModal
