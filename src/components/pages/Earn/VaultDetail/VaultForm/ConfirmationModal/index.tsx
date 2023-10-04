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

import { TrackingEvents, useMixpanel } from '@/analytics'
import { ModalDetail, ModalStep } from '@/components/shared/ModalComponents'
import Toast, { ToastMessage } from '@/components/shared/Toast'
import { StaleAfterMessage } from '@/components/shared/components'
import { VaultAccountSnapshot2, VaultSnapshot2, useVaultTransactions } from '@/hooks/vaults2'
import { Balances } from '@/hooks/wallet'
import { Big6Math, formatBig6USDPrice } from '@/utils/big6Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { FormValues, VaultFormOption, initialTransactionState } from '../constants'
import { useVaultFormCopy } from '../hooks'
import { RequiredApprovals, TransactionState } from './constants'
import { getRequiredApprovals, setAmountForConfirmation } from './utils'

interface ConfirmationModalProps {
  onClose: () => void
  onCancel: () => void
  vaultOption: VaultFormOption
  balances: Balances
  formValues: FormValues
  vaultName: string
  vaultSnapshot: VaultSnapshot2
  vaultUserSnapshot: VaultAccountSnapshot2
  maxWithdrawal: boolean
}

export default function ConfirmationModal({
  onClose,
  onCancel,
  vaultOption,
  balances,
  formValues,
  vaultSnapshot,
  vaultName,
  vaultUserSnapshot,
  maxWithdrawal,
}: ConfirmationModalProps) {
  const copy = useVaultFormCopy()
  const intl = useIntl()
  const toast = useToast()
  const { track } = useMixpanel()
  const { onApproveUSDC, onApproveOperator, onDeposit, onRedeem } = useVaultTransactions(vaultSnapshot.vault)
  const bigintAmount = setAmountForConfirmation({
    maxWithdrawal,
    vaultUserSnapshot,
    amount: formValues.amount,
  })

  const [requiredApprovals, setRequiredApprovals] = useState<RequiredApprovals[]>()

  const [transactionState, setTransactionState] = useState<TransactionState>(initialTransactionState)
  const {
    approveUSDCLoading,
    approveUSDCCompleted,
    depositCompleted,
    depositLoading,
    approveOperatorCompleted,
    approveOperatorLoading,
    redemptionCompleted,
    redemptionLoading,
  } = transactionState

  const isDeposit = vaultOption === VaultFormOption.Deposit
  const settlementFee = formatBig6USDPrice(
    isDeposit ? vaultSnapshot.totalSettlementFee : vaultSnapshot.totalSettlementFee * 2n,
    { compact: true },
  )
  const formattedAmount = formatBig6USDPrice(Big6Math.fromFloatString(formValues.amount))

  useEffect(() => {
    const requiredApprovals = getRequiredApprovals({
      amount: bigintAmount,
      vaultAccountSnapshot: vaultUserSnapshot,
      vaultOption,
      balances,
    })
    setRequiredApprovals(requiredApprovals)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUSDCApproval = async () => {
    setTransactionState((prevState) => ({ ...prevState, approveUSDCLoading: true }))
    try {
      await onApproveUSDC()
      setTransactionState((prevState) => ({ ...prevState, approveUSDCCompleted: true }))
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, approveUSDCLoading: false }))
    }
  }
  const handleOperatorApproval = async () => {
    setTransactionState((prevState) => ({ ...prevState, approveOperatorLoading: true }))
    try {
      await onApproveOperator()
      setTransactionState((prevState) => ({ ...prevState, approveOperatorCompleted: true }))
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, approveOperatorLoading: false }))
    }
  }

  const handleDeposit = async () => {
    setTransactionState((prevState) => ({ ...prevState, depositLoading: true }))
    try {
      const receipt = await onDeposit(bigintAmount)
      if (receipt?.status === 'success') {
        setTransactionState((prevState) => ({ ...prevState, depositCompleted: true }))
        onClose()
        const message = copy.depositToast(formattedAmount, vaultName)
        toast({
          render: ({ onClose }) => (
            <Toast
              title={copy.collateralDeposited}
              onClose={onClose}
              body={<ToastMessage action={copy.Deposit} message={message} actionColor={colors.brand.green} />}
            />
          ),
        })
        track(TrackingEvents.depositToVault, { vaultName, amount: formValues.amount })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, depositLoading: false }))
    }
  }

  const handleRedemption = async () => {
    setTransactionState((prevState) => ({ ...prevState, redemptionLoading: true }))
    try {
      const receipt = await onRedeem(bigintAmount, { max: maxWithdrawal || bigintAmount === vaultUserSnapshot.assets })
      if (receipt?.status === 'success') {
        setTransactionState((prevState) => ({ ...prevState, redemptionCompleted: true }))
        onClose()
        const message = copy.redeemToast(formattedAmount, vaultName)
        toast({
          render: ({ onClose }) => (
            <Toast
              title={copy.assetsRedeemed}
              onClose={onClose}
              body={<ToastMessage action={copy.Redeem} message={message} actionColor={colors.brand.green} />}
            />
          ),
        })
        track(TrackingEvents.redeemFromVault, { vaultName, amount: formValues.amount })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, redemptionLoading: false }))
    }
  }

  const requiresUSDCApproval = requiredApprovals?.includes(RequiredApprovals.usdc)
  const requiresOperatorApproval = requiredApprovals?.includes(RequiredApprovals.operator)

  return (
    <Modal isOpen onClose={onClose} isCentered variant="confirmation">
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Flex direction="column" maxWidth="350px">
            <Text fontSize="18px" mb={1}>
              {isDeposit ? copy.confirmDeposit : copy.confirmWithdraw}
            </Text>
            <Text variant="label" fontSize="13px" mb={5}>
              {isDeposit ? copy.confirmDepositBody : copy.confirmWithdrawBody}
            </Text>
            {requiresOperatorApproval && (
              <ModalStep
                title={copy.approveOperator}
                description={copy.approveOperatorBody}
                isLoading={approveOperatorLoading}
                isCompleted={approveOperatorCompleted}
              />
            )}
            {isDeposit && (
              <>
                {requiresUSDCApproval && (
                  <ModalStep
                    title={copy.approveUSDC}
                    description={copy.approveUSDCBody}
                    isLoading={approveUSDCLoading}
                    isCompleted={approveUSDCCompleted}
                  />
                )}
                <ModalStep
                  title={copy.depositCollateral}
                  description={intl.formatMessage({ defaultMessage: 'Add funds to {vaultName} vault' }, { vaultName })}
                  isLoading={depositLoading}
                  isCompleted={depositCompleted}
                />
                <ModalDetail
                  title={copy.addToVault}
                  action={copy.Deposit}
                  color={colors.brand.green}
                  detail={intl.formatMessage(
                    { defaultMessage: '{amount} to {vaultName}' },
                    { amount: formattedAmount, vaultName },
                  )}
                  subDetail={intl.formatMessage(
                    { defaultMessage: 'Settlement Fee: {amount}' },
                    {
                      amount: (
                        <>
                          {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                          <Text as="span" color={colors.brand.red} mr={1}>
                            -
                          </Text>
                          {settlementFee}
                        </>
                      ),
                    },
                  )}
                />
              </>
            )}
            {!isDeposit && (
              <>
                <ModalStep
                  title={copy.redeemShares}
                  description={intl.formatMessage(
                    { defaultMessage: 'Redeem funds from {vaultName} vault' },
                    { vaultName },
                  )}
                  isLoading={redemptionLoading}
                  isCompleted={redemptionCompleted}
                />
                <ModalDetail
                  title={copy.redeemFromVault}
                  action={copy.Redeem}
                  color={colors.brand.purple[240]}
                  detail={intl.formatMessage(
                    { defaultMessage: '{amount} from {vaultName}' },
                    {
                      amount: formattedAmount,
                      vaultName,
                    },
                  )}
                  subDetail={intl.formatMessage(
                    { defaultMessage: 'Settlement Fee: {amount}' },
                    {
                      amount: (
                        <>
                          {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                          <Text as="span" color={colors.brand.red} mr={1}>
                            -
                          </Text>
                          {settlementFee}
                        </>
                      ),
                    },
                  )}
                />
              </>
            )}
            <StaleAfterMessage
              staleAfter={Big6Math.min(
                ...vaultSnapshot.marketSnapshots.map((marketSnapshot) => marketSnapshot.riskParameter.staleAfter),
              ).toString()}
            />
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="initial">
          <VStack flex={1}>
            {requiresOperatorApproval && (
              <Button
                variant={approveOperatorCompleted ? 'outline' : 'primary'}
                isDisabled={approveOperatorCompleted || approveOperatorLoading}
                label={approveOperatorLoading ? <Spinner size="sm" /> : copy.approveOperator}
                onClick={handleOperatorApproval}
                width="100%"
              />
            )}
            {isDeposit && (
              <>
                {requiresUSDCApproval && (
                  <Button
                    variant={approveUSDCCompleted ? 'outline' : 'primary'}
                    isDisabled={approveUSDCCompleted || approveUSDCLoading}
                    label={approveUSDCLoading ? <Spinner size="sm" /> : copy.approveUSDC}
                    onClick={handleUSDCApproval}
                    width="100%"
                  />
                )}
                <Button
                  variant={requiresUSDCApproval && !approveUSDCCompleted ? 'outline' : 'primary'}
                  isDisabled={(requiresUSDCApproval && !approveUSDCCompleted) || depositLoading || depositCompleted}
                  label={depositLoading ? <Spinner size="sm" /> : copy.Deposit}
                  onClick={handleDeposit}
                  width="100%"
                />
              </>
            )}
            {!isDeposit && (
              <>
                <Button
                  variant={
                    (requiresOperatorApproval && !approveOperatorCompleted) || redemptionCompleted
                      ? 'outline'
                      : 'primary'
                  }
                  isDisabled={
                    (requiresOperatorApproval && !approveOperatorCompleted) || redemptionLoading || redemptionCompleted
                  }
                  label={redemptionLoading ? <Spinner size="sm" /> : copy.redeemShares}
                  onClick={handleRedemption}
                  width="100%"
                />
              </>
            )}
            <Button variant="secondary" onClick={onCancel} label={copy.cancel} width="100%" />
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
