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
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Address } from 'viem'

import { TrackingEvents, useMixpanel } from '@/analytics'
import { ModalDetail, ModalStep } from '@/components/shared/ModalComponents'
import Toast, { ToastMessage } from '@/components/shared/Toast'
import { SupportedAsset } from '@/constants/assets'
import { OpenPositionType, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { PositionDetails, useProductTransactions } from '@/hooks/markets'
import { Big18Math, formatBig18USDPrice } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { ProductSnapshot } from '@t/perennial'

import { OrderValues } from '../../constants'
import { PositionInfo } from './components'
import { useAdjustmentModalCopy } from './hooks'
import { createAdjustment, getOrderToastProps } from './utils'

interface AdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onCancel: () => void
  title: string
  asset: SupportedAsset
  position?: PositionDetails
  product: ProductSnapshot
  crossProduct?: Address
  usdcAllowance: bigint
  orderValues: OrderValues
  leverage: string
  positionType: OpenPositionType
  positionDelta?: bigint
  variant: 'close' | 'adjust' | 'withdraw'
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
  crossProduct,
  usdcAllowance,
  leverage,
  positionDelta,
  variant,
}: AdjustmentModalProps) {
  const toast = useToast()
  const intl = useIntl()
  const copy = useAdjustmentModalCopy()
  const [approveUsdcLoading, setApproveUsdcLoading] = useState(false)
  const [usdcApproved, setUsdcApproved] = useState(false)
  const [withdrawCollateralLoading, setWithdrawCollateralLoading] = useState(false)
  const [awaitingSettlement, setAwaitingSettlement] = useState(false)
  const [orderTxLoading, setOrderTxLoading] = useState(false)
  const [isTransactionCompleted, setIsTransactionCompleted] = useState(false)
  const [isSettlementCompleted, setIsSettlementCompleted] = useState(false)
  const { orderDirection, isMaker, makerOrderDirection } = useMarketContext()
  const { track } = useMixpanel()

  const { productAddress } = product
  const { onApproveUSDC, onModifyPosition } = useProductTransactions(productAddress)

  const adjustment = createAdjustment({
    position,
    product,
    orderValues,
    usdcAllowance,
  })

  const {
    collateral: { prevCollateral, newCollateral, difference: collateralDifference, crossCollateral },
    position: { prevPosition, newPosition, difference: positionDifference },
    leverage: { prevLeverage, newLeverage },
    needsApproval,
    requiresTwoStep,
  } = adjustment
  const positionSettled = position && position.position === position.nextPosition
  const isWithdrawing =
    variant === 'withdraw' || (position?.status === PositionStatus.closed && newCollateral === 0n && newPosition === 0n)

  const [step, setStep] = useState(() => {
    if (needsApproval) return 0
    if (positionSettled && isWithdrawing) return 2
    return 1
  })

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
      const { action, message, title, actionColor } = getOrderToastProps({
        orderDirection: isMaker ? makerOrderDirection : orderDirection,
        variant,
        asset,
        amount: orderValues.amount,
        product,
        copy,
        intl,
        adjustment,
      })
      await onModifyPosition(collateralModification, positionType, positionDifference, {
        crossCollateral,
        crossProduct,
        txHistoryLabel: title,
      })
      setIsTransactionCompleted(true)
      toast({
        render: ({ onClose }) => (
          <Toast
            title={title}
            onClose={onClose}
            body={<ToastMessage action={action} message={message} actionColor={actionColor} />}
          />
        ),
      })
      track(isMaker ? TrackingEvents.make : TrackingEvents.trade, {
        asset,
        leverage,
        orderDirection: isMaker ? makerOrderDirection : orderDirection,
        orderType: title,
        collateral: orderValues.collateral,
        amount: orderValues.amount,
        orderAction: action || '',
      })
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
      await onModifyPosition(collateralDifference, positionType, 0n, { txHistoryLabel: copy.withdraw })
      onClose()
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.withdrawComplete}
            onClose={onClose}
            body={
              <ToastMessage
                action={copy.withdraw}
                message={formatBig18USDPrice(Big18Math.abs(collateralDifference))}
                actionColor={colors.brand.green}
              />
            }
          />
        ),
      })
      track(TrackingEvents.withdrawCollateral, {
        asset,
        collateral: Big18Math.toFloatString(Big18Math.abs(collateralDifference)),
      })
    } catch (err) {
      console.error(err)
      setWithdrawCollateralLoading(false)
    }
  }

  const showWithdrawButton = isWithdrawing || requiresTwoStep || step === 2
  const showSettlementStep = requiresTwoStep || isSettlementCompleted

  return (
    <Modal isOpen={isOpen} onClose={onCancel} isCentered variant="confirmation">
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
              <ModalStep
                title={copy.approveUsdcTitle}
                description={copy.approveUsdcBody}
                isLoading={needsApproval ? approveUsdcLoading : false}
                isCompleted={usdcApproved}
              />
            )}
            {!isWithdrawing ? (
              <ModalStep
                title={requiresTwoStep ? copy.confirmCloseTitle : copy.signTransactionTitle}
                description={requiresTwoStep ? copy.confirmCloseBody : copy.signTransactionBody}
                isLoading={orderTxLoading}
                isCompleted={isTransactionCompleted}
              />
            ) : (
              <ModalStep
                title={copy.withdrawStepTitle}
                description={copy.withdrawStepBody}
                isLoading={withdrawCollateralLoading}
                isCompleted={isSettlementCompleted}
              />
            )}
            {showSettlementStep && (
              <ModalStep
                title={copy.awaitSettlementTitle}
                description={copy.awaitSettlementBody}
                isLoading={awaitingSettlement}
                isCompleted={isSettlementCompleted}
              />
            )}
            {!isWithdrawing ? (
              <PositionInfo
                newPosition={newPosition}
                newCollateral={newCollateral}
                newLeverage={newLeverage}
                prevPosition={prevPosition}
                prevCollateral={prevCollateral}
                prevLeverage={prevLeverage}
                asset={asset}
                orderDirection={orderDirection}
                product={product}
                positionDelta={positionDelta}
                frozen
              />
            ) : (
              <ModalDetail
                title={copy.withdrawDetailTitle}
                action={copy.withdraw}
                detail={formatBig18USDPrice(Big18Math.abs(collateralDifference))}
                color={colors.brand.purple[240]}
              />
            )}
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="initial">
          <VStack flex={1}>
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
            <Button variant="cancel" onClick={onCancel} label={copy.cancel} width="100%" />
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AdjustPositionModal
