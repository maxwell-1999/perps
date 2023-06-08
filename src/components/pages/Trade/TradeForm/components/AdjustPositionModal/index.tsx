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
import { useEffect, useState } from 'react'

import { SupportedAsset } from '@/constants/assets'
import { OpenPositionType } from '@/constants/markets'
import { PositionDetails, useProductTransactions } from '@/hooks/markets'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { IPerennialLens } from '@t/generated/LensAbi'

import { OrderValues } from '../../constants'
import { PositionInfo } from './components'
import { useAdjustmentModalCopy } from './hooks'
import { createAdjustment } from './utils'

interface AdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onCancel: () => void
  title: string
  asset: SupportedAsset
  position?: PositionDetails
  product: IPerennialLens.ProductSnapshotStructOutput
  usdcAllowance: bigint
  orderValues: OrderValues
  positionType: OpenPositionType
}

function AdjustPositionModal({
  asset,
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
  const [withdrawCollateralLoading, setWithdrawCollateralLoading] = useState(false)
  const [awaitingSettlement, setAwaitingSettlement] = useState(false)
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
    collateral: { prevCollateral, newCollateral, difference: collateralDifference },
    position: { prevPosition, newPosition, difference: positionDifference },
    leverage: { prevLeverage, newLeverage },
    needsApproval,
    requiresTwoStep,
  } = adjustment
  const positionSettled = position && position.position === position.nextPosition

  const [step, setStep] = useState(needsApproval ? 0 : 1)
  useEffect(() => {
    if (positionSettled && awaitingSettlement) setAwaitingSettlement(false)
  }, [positionSettled, awaitingSettlement])

  const handleApproveUSDC = async () => {
    setApproveUsdcLoading(true)
    try {
      await onApproveUSDC()
    } catch (err) {
      console.error(err)
    } finally {
      setApproveUsdcLoading(false)
      setStep(1)
    }
  }

  const handleSetOrder = async () => {
    setOrderTxLoading(true)
    try {
      // If this requires two-step, then the collateral should stay the same
      const collateralModification = requiresTwoStep ? 0n : collateralDifference
      await onModifyPosition(collateralModification, positionType, positionDifference)
      if (!requiresTwoStep) onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setStep(2)
      setOrderTxLoading(false)
      if (requiresTwoStep) setAwaitingSettlement(true)
    }
  }

  const handleWithdrawCollateral = async () => {
    setWithdrawCollateralLoading(true)
    try {
      await onModifyPosition(collateralDifference, positionType, 0n)
      onClose()
    } catch (err) {
      console.error(err)
      setWithdrawCollateralLoading(false)
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
                <PositionInfo
                  position={prevPosition}
                  collateral={prevCollateral}
                  leverage={prevLeverage}
                  isPrevious
                  asset={asset}
                />
                <Box height="20px" width="20px">
                  <RightArrow />
                </Box>
                <PositionInfo position={newPosition} collateral={newCollateral} leverage={newLeverage} asset={asset} />
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              isDisabled={step !== 0}
              label={approveUsdcLoading ? <Spinner size="sm" /> : copy.approveUSDC}
              onClick={handleApproveUSDC}
            />
            <Button
              isDisabled={step !== 1}
              label={orderTxLoading || awaitingSettlement ? <Spinner size="sm" /> : copy.placeOrder}
              onClick={handleSetOrder}
              minWidth="110px"
            />
            {(requiresTwoStep || step === 2) && (
              <Button
                isDisabled={step !== 2 || awaitingSettlement}
                label={withdrawCollateralLoading ? <Spinner size="sm" /> : copy.withdraw}
                onClick={handleWithdrawCollateral}
              />
            )}
            <Button variant="secondary" onClick={onCancel} label={copy.cancel} mr={1} />
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AdjustPositionModal
