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
import { memo } from 'react'
import { useIntl } from 'react-intl'
import { Address } from 'viem'

import { TrackingEvents, useMixpanel } from '@/analytics'
import { ModalDetail, ModalStep } from '@/components/shared/ModalComponents'
import Toast, { ToastMessage } from '@/components/shared/Toast'
import { useTransactionToasts } from '@/components/shared/Toast/transactionToasts'
import { StaleAfterMessage } from '@/components/shared/components'
import { PositionSide2, PositionStatus, SupportedAsset } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { MarketSnapshot, UserMarketSnapshot, useMarketTransactions2 } from '@/hooks/markets2'
import { useChainId } from '@/hooks/network'
import { Big6Math, formatBig6, formatBig6USDPrice } from '@/utils/big6Utils'
import { usePrevious } from '@/utils/hooks'
import { UpdateNoOp } from '@/utils/positionUtils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { OrderValues } from '../../constants'
import { PositionInfo } from './components'
import { useAdjustmentModalCopy } from './hooks'
import { createAdjustment, getOrderToastProps } from './utils'

export interface AdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onCancel: () => void
  title: string
  asset: SupportedAsset
  position?: UserMarketSnapshot
  market: MarketSnapshot
  crossProduct?: Address
  usdcAllowance: bigint
  orderValues: OrderValues
  positionSide: PositionSide2
  positionDelta?: bigint
  variant: 'close' | 'adjust' | 'withdraw'
  isRetry?: boolean
}

const AdjustPositionModal = memo(
  function AdjustPositionModalInner({
    asset,
    isOpen,
    onClose,
    title,
    onCancel,
    orderValues,
    positionSide,
    position,
    market,
    usdcAllowance,
    positionDelta,
    variant,
    isRetry,
  }: AdjustmentModalProps) {
    const chainId = useChainId()

    const adjustment = createAdjustment({
      position,
      market,
      orderValues,
      usdcAllowance,
      chainId,
      positionSide,
    })

    const {
      collateral: { prevCollateral, newCollateral, difference: collateralDifference },
      position: { prevPosition, newPosition, interfaceFee, tradeFee, settlementFee },
      leverage: { prevLeverage, newLeverage },
      needsApproval,
      approvalAmount,
      requiresTwoStep,
    } = adjustment

    const priorPosition = usePrevious(position)
    const positionSettled =
      position && priorPosition?.status === PositionStatus.closing && position.status === PositionStatus.closed
    const isWithdrawing =
      variant === 'withdraw' ||
      (position?.status === PositionStatus.closed && newCollateral === 0n && newPosition === 0n)

    const toast = useToast()
    const intl = useIntl()
    const copy = useAdjustmentModalCopy()
    const [needsUsdcApproval, setNeedsUsdcApproval] = useState(false)
    const [approveUsdcLoading, setApproveUsdcLoading] = useState(false)
    const [insufficientApproval, setInsufficientApproval] = useState(false)
    const [usdcApproved, setUsdcApproved] = useState(false)
    const [withdrawCollateralLoading, setWithdrawCollateralLoading] = useState(false)
    const [awaitingSettlement, setAwaitingSettlement] = useState(false)
    const [orderTxLoading, setOrderTxLoading] = useState(false)
    const [isTransactionCompleted, setIsTransactionCompleted] = useState(false)
    const [isSettlementCompleted, setIsSettlementCompleted] = useState(false)
    const [step, setStep] = useState(1)
    const { track } = useMixpanel()
    const { isMaker } = useMarketContext()
    const { waitForTransactionAlert } = useTransactionToasts()

    const { market: marketAddress } = market
    const { onApproveUSDC, onModifyPosition } = useMarketTransactions2(marketAddress)

    useEffect(() => {
      if (needsApproval) {
        setNeedsUsdcApproval(true)
        setStep(0)
        return
      }
      if (positionSettled && isWithdrawing) {
        setStep(2)
        return
      }
      setStep(1)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      if (positionSettled && awaitingSettlement) {
        setIsSettlementCompleted(true)
        setAwaitingSettlement(false)
      }
    }, [positionSettled, awaitingSettlement])

    const handleApproveUSDC = async () => {
      setApproveUsdcLoading(true)
      try {
        const { newAllowance } = await onApproveUSDC()
        if (newAllowance >= approvalAmount) {
          setUsdcApproved(true)
          setInsufficientApproval(false)
          setStep(1)
        } else {
          setUsdcApproved(false)
          setInsufficientApproval(true)
        }
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
          positionSide,
          variant,
          asset,
          amount: orderValues.amount,
          market: market,
          copy,
          intl,
          adjustment,
          isMaker,
        })
        const hash = await onModifyPosition({
          collateralDelta: collateralModification,
          positionSide: positionSide,
          positionAbs: newPosition,
          interfaceFee,
        })
        if (hash) {
          waitForTransactionAlert(hash, {
            onError: () => {
              setOrderTxLoading(false)
              setIsTransactionCompleted(false)
              setAwaitingSettlement(false)
              if (requiresTwoStep) {
                setStep(1)
              }
            },
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
            leverage: formatBig6(newLeverage),
            orderDirection: positionSide,
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
        }
      } catch (err) {
        console.error(err)
      } finally {
        setOrderTxLoading(false)
      }
    }

    const handleWithdrawCollateral = async () => {
      setWithdrawCollateralLoading(true)
      try {
        await onModifyPosition({
          collateralDelta: collateralDifference,
          positionSide: positionSide,
          positionAbs: UpdateNoOp,
          txHistoryLabel: copy.withdraw,
        })
        onClose()
        toast({
          render: ({ onClose }) => (
            <Toast
              title={copy.withdrawComplete}
              onClose={onClose}
              body={
                <ToastMessage
                  action={copy.withdraw}
                  message={formatBig6USDPrice(Big6Math.abs(collateralDifference))}
                  actionColor={colors.brand.green}
                />
              }
            />
          ),
        })
        track(TrackingEvents.withdrawCollateral, {
          asset,
          collateral: Big6Math.toFloatString(Big6Math.abs(collateralDifference)),
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
            <Flex direction="column" width="350px">
              <Text fontSize="18px" mb={1}>
                {isRetry ? copy.retryFailedOrder : isWithdrawing ? copy.confirmWithdrawTitle : title}
              </Text>
              <Text variant="label" fontSize="13px" mb="21px">
                {isRetry ? copy.retryBody : copy.approveRequests}
              </Text>
              {needsUsdcApproval && (
                <ModalStep
                  title={copy.approveUsdcTitle}
                  description={
                    insufficientApproval ? copy.insufficientUsdcApproval(approvalAmount) : copy.approveUsdcBody
                  }
                  isLoading={needsUsdcApproval ? approveUsdcLoading : false}
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
                  positionSide={positionSide}
                  market={market}
                  positionDelta={positionDelta}
                  interfaceFee={interfaceFee}
                  tradeFee={tradeFee}
                  settlementFee={settlementFee}
                  frozen
                />
              ) : (
                <ModalDetail
                  title={copy.withdrawDetailTitle}
                  action={copy.withdraw}
                  detail={formatBig6USDPrice(Big6Math.abs(collateralDifference))}
                  color={colors.brand.purple[240]}
                />
              )}
              <StaleAfterMessage staleAfter={market.riskParameter.staleAfter.toString()} />
            </Flex>
          </ModalBody>
          <ModalFooter justifyContent="initial">
            <VStack flex={1}>
              {needsUsdcApproval && (
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
  },
  (prevProps, props) => {
    const { position } = props
    const { position: prevPosition } = prevProps
    // Unfreeze props for closing state so settlement can resolve in modal
    if (
      position?.status === PositionStatus.closing ||
      (prevPosition?.status === PositionStatus.closing && position?.status === PositionStatus.closed)
    ) {
      return false
    }
    return true
  },
)

export default AdjustPositionModal
