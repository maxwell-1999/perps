import {
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { SupportedAsset } from '@/constants/assets'
import { OpenPositionType, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { PositionDetails, useProductTransactions } from '@/hooks/markets'
import { formatBig18USDPrice } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { IPerennialLens } from '@t/generated/LensAbi'

import { OrderValues } from '../../constants'
import { AdjustmentStep, PositionInfo, TransferDetail } from './components'
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
  const [usdcApproved, setUsdcApproved] = useState(false)
  const [withdrawCollateralLoading, setWithdrawCollateralLoading] = useState(false)
  const [awaitingSettlement, setAwaitingSettlement] = useState(false)
  const [orderTxLoading, setOrderTxLoading] = useState(false)
  const [isTransactionCompleted, setIsTransactionCompleted] = useState(false)
  const [isSettlementCompleted, setIsSettlementCompleted] = useState(false)
  const { orderDirection } = useMarketContext()

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
  const isWithdrawing =
    position?.status === PositionStatus.closed && orderValues.amount === '0' && orderValues.collateral === '0'

  const [step, setStep] = useState(needsApproval ? 0 : 1)

  useEffect(() => {
    if (positionSettled && awaitingSettlement) {
      setIsSettlementCompleted(true)
      setAwaitingSettlement(false)
    }
  }, [positionSettled, awaitingSettlement])

  const handleApproveUSDC = async () => {
    setApproveUsdcLoading(true)
    try {
      await onApproveUSDC()
      setUsdcApproved(true)
      setStep(1)
    } catch (err) {
      console.error(err)
    } finally {
      setApproveUsdcLoading(false)
    }
  }

  const handleSetOrder = async () => {
    setOrderTxLoading(true)
    try {
      // If this requires two-step, then the collateral should stay the same
      const collateralModification = requiresTwoStep ? 0n : collateralDifference
      await onModifyPosition(collateralModification, positionType, positionDifference)
      setIsTransactionCompleted(true)
      if (!requiresTwoStep) {
        onClose()
      } else {
        setAwaitingSettlement(true)
      }
      setStep(2)
    } catch (err) {
      console.error(err)
    } finally {
      setOrderTxLoading(false)
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

  const showWithdrawButton = isWithdrawing || requiresTwoStep || step === 2
  const showSettlementStep = requiresTwoStep || isSettlementCompleted

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered variant="confirmation">
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Flex direction="column" maxWidth="350px">
            <Text fontSize="18px" mb={1}>
              {isWithdrawing ? copy.confirmWithdrawTitle : title}
            </Text>
            <Text variant="label" fontSize="13px" mb="21px">
              {copy.approveRequests}
            </Text>
            {needsApproval && (
              <AdjustmentStep
                title={copy.approveUsdcTitle}
                description={copy.approveUsdcBody}
                isLoading={needsApproval ? approveUsdcLoading : false}
                isCompleted={usdcApproved}
              />
            )}
            {!isWithdrawing ? (
              <AdjustmentStep
                title={requiresTwoStep ? copy.confirmCloseTitle : copy.signTransactionTitle}
                description={requiresTwoStep ? copy.confirmCloseBody : copy.signTransactionBody}
                isLoading={orderTxLoading}
                isCompleted={isTransactionCompleted}
              />
            ) : (
              <>
                <AdjustmentStep
                  title={copy.withdrawStepTitle}
                  description={copy.withdrawStepBody}
                  isLoading={withdrawCollateralLoading}
                  isCompleted={isSettlementCompleted}
                />
                <TransferDetail
                  title={copy.withdrawDetailTitle}
                  action={copy.withdraw}
                  detail={formatBig18USDPrice(prevCollateral)}
                  color={colors.brand.purple[240]}
                />
              </>
            )}
            {showSettlementStep && (
              <AdjustmentStep
                title={copy.awaitSettlementTitle}
                description={copy.awaitSettlementBody}
                isLoading={awaitingSettlement}
                isCompleted={isSettlementCompleted}
              />
            )}
            {!isWithdrawing && (
              <PositionInfo
                newPosition={newPosition}
                newCollateral={newCollateral}
                newLeverage={newLeverage}
                prevPosition={prevPosition}
                prevCollateral={prevCollateral}
                prevLeverage={prevLeverage}
                asset={asset}
                orderDirection={orderDirection}
              />
            )}
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="initial">
          <VStack width="100%">
            <Button variant="secondary" onClick={onCancel} label={copy.cancel} mr={1} width="100%" />
            {needsApproval && (
              <Button
                variant={step !== 0 ? 'outline' : 'primary'}
                isDisabled={step !== 0 || approveUsdcLoading}
                label={approveUsdcLoading ? <Spinner size="sm" /> : copy.approveUSDC}
                onClick={handleApproveUSDC}
                width="100%"
              />
            )}
            {!isWithdrawing && (
              <Button
                variant={step !== 1 ? 'outline' : 'primary'}
                isDisabled={step !== 1 || orderTxLoading}
                label={
                  orderTxLoading ? <Spinner size="sm" /> : requiresTwoStep ? copy.confirmCloseTitle : copy.placeOrder
                }
                onClick={handleSetOrder}
                width="100%"
              />
            )}
            {showWithdrawButton && (
              <Button
                variant={step !== 2 ? 'outline' : 'primary'}
                isDisabled={(step !== 2 && !isWithdrawing) || awaitingSettlement || withdrawCollateralLoading}
                label={withdrawCollateralLoading ? <Spinner size="sm" /> : copy.withdraw}
                onClick={handleWithdrawCollateral}
                width="100%"
              />
            )}
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AdjustPositionModal
