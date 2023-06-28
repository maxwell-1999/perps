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
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'

import { ModalDetail, ModalStep } from '@/components/shared/ModalComponents'
import Toast, { ToastMessage } from '@/components/shared/Toast'
import { VaultSnapshot, VaultUserSnapshot, useVaultTransactions } from '@/hooks/vaults'
import { Balances } from '@/hooks/wallet'
import { Big18Math, formatBig18 } from '@/utils/big18Utils'

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
  vaultSnapshot: VaultSnapshot
  vaultUserSnapshot: VaultUserSnapshot
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
  const addRecentTransaction = useAddRecentTransaction()
  const { onApproveUSDC, onApproveShares, onDeposit, onRedeem } = useVaultTransactions(vaultSnapshot.symbol)
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
    approveSharesCompleted,
    approveSharesLoading,
    redemptionCompleted,
    redemptionLoading,
  } = transactionState

  const isDeposit = vaultOption === VaultFormOption.Deposit
  const formattedAmount = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(formValues.amount))

  useEffect(() => {
    const requiredApprovals = getRequiredApprovals({
      amount: bigintAmount,
      vaultSnapshot,
      vaultSymbol: vaultSnapshot.symbol,
      vaultOption,
      balances,
    })
    setRequiredApprovals(requiredApprovals)
  }, [])

  const handleUSDCApproval = async () => {
    setTransactionState((prevState) => ({ ...prevState, approveUSDCLoading: true }))
    try {
      const hash = await onApproveUSDC()
      addRecentTransaction({
        hash,
        description: copy.approveUSDC,
      })
      setTransactionState((prevState) => ({ ...prevState, approveUSDCCompleted: true }))
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, approveUSDCLoading: false }))
    }
  }
  const handleSharesApproval = async () => {
    setTransactionState((prevState) => ({ ...prevState, approveSharesLoading: true }))
    try {
      const hash = await onApproveShares()
      if (hash) {
        addRecentTransaction({
          hash,
          description: copy.approveShares,
        })
      }
      setTransactionState((prevState) => ({ ...prevState, approveSharesCompleted: true }))
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, approveSharesLoading: false }))
    }
  }

  const handleDeposit = async () => {
    setTransactionState((prevState) => ({ ...prevState, depositLoading: true }))
    try {
      const hash = await onDeposit(bigintAmount)
      if (hash) {
        addRecentTransaction({
          hash,
          description: copy.Deposit,
        })
      }
      setTransactionState((prevState) => ({ ...prevState, depositCompleted: true }))
      onClose()
      const message = intl.formatMessage(
        { defaultMessage: '{formattedAmount} to {vaultName}' },
        { formattedAmount, vaultName },
      )
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.collateralDeposited}
            onClose={onClose}
            body={<ToastMessage action={copy.Deposit} message={message} actionColor={colors.brand.green} />}
          />
        ),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, depositLoading: false }))
    }
  }

  const handleRedemption = async () => {
    setTransactionState((prevState) => ({ ...prevState, redemptionLoading: true }))
    try {
      const hash = await onRedeem(bigintAmount, { max: maxWithdrawal || bigintAmount === vaultUserSnapshot.assets })
      setTransactionState((prevState) => ({ ...prevState, redemptionCompleted: true }))
      onClose()
      if (hash) {
        addRecentTransaction({
          hash,
          description: copy.Redeem,
        })
      }
      const message = intl.formatMessage(
        { defaultMessage: '{formattedAmount} from {vaultName}' },
        { formattedAmount, vaultName },
      )
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.assetsRedeemed}
            onClose={onClose}
            body={<ToastMessage action={copy.Redeem} message={message} actionColor={colors.brand.green} />}
          />
        ),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, redemptionLoading: false }))
    }
  }

  const requiresUSDCApproval = requiredApprovals?.includes(RequiredApprovals.usdc)
  const requiresSharesApproval = requiredApprovals?.includes(RequiredApprovals.shares)
  const approximateShares = formatBig18(
    Big18Math.div(Big18Math.mul(bigintAmount, vaultSnapshot.totalSupply), vaultSnapshot.totalAssets),
  )

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
                />
              </>
            )}
            {!isDeposit && (
              <>
                {requiresSharesApproval && (
                  <ModalStep
                    title={copy.approveShares}
                    description={intl.formatMessage(
                      { defaultMessage: 'Approve at least {approximateShares} shares to redeem your funds' },
                      { approximateShares },
                    )}
                    isLoading={approveSharesLoading}
                    isCompleted={approveSharesCompleted}
                  />
                )}
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
                />
              </>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="initial">
          <VStack flex={1}>
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
                {requiresSharesApproval && (
                  <Button
                    variant={approveSharesCompleted ? 'outline' : 'primary'}
                    isDisabled={approveSharesCompleted || approveSharesLoading}
                    label={approveSharesLoading ? <Spinner size="sm" /> : copy.approveShares}
                    onClick={handleSharesApproval}
                    width="100%"
                  />
                )}
                <Button
                  variant={
                    (requiresSharesApproval && !approveSharesCompleted) || redemptionCompleted ? 'outline' : 'primary'
                  }
                  isDisabled={
                    (requiresSharesApproval && !approveSharesCompleted) || redemptionLoading || redemptionCompleted
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
