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
import { useIntl } from 'react-intl'
import { parseEther } from 'viem'

import { ModalDetail, ModalStep } from '@/components/shared/ModalComponents'
import { VaultSnapshot, VaultUserSnapshot } from '@/constants/vaults'
import { useVaultTransactions } from '@/hooks/vaults'
import { Balances } from '@/hooks/wallet'
import { Big18Math, formatBig18, formatBig18USDPrice } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { FormValues, RequiredApprovals, TransactionState, VaultFormOption, initialTransactionState } from './constants'
import { useVaultFormCopy } from './hooks'
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
  isClaimOnly: boolean
  positionUpdating: boolean
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
  isClaimOnly,
  positionUpdating,
}: ConfirmationModalProps) {
  const copy = useVaultFormCopy()
  const intl = useIntl()
  const { onApproveUSDC, onApproveShares, onDeposit, onRedeem, onClaim, onApproveDSU } = useVaultTransactions(
    vaultSnapshot.symbol,
  )
  const bigintAmount = setAmountForConfirmation({
    maxWithdrawal,
    vaultUserSnapshot,
    amount: formValues.amount,
    isClaimOnly,
  })

  const hasClaimable = !Big18Math.isZero(
    Big18Math.add(vaultUserSnapshot.claimable, vaultUserSnapshot.pendingRedemptionAmount),
  )
  const hasAssets = !Big18Math.isZero(vaultUserSnapshot.assets)

  const [requiredApprovals, setRequiredApprovals] = useState<RequiredApprovals[]>()

  // TODO: manage tx state with useQuery status
  const [transactionState, setTransactionState] = useState<TransactionState>(initialTransactionState)
  const {
    approveUSDCLoading,
    approveUSDCCompleted,
    depositCompleted,
    depositLoading,
    approveDSUCompleted,
    approveDSULoading,
    approveSharesCompleted,
    approveSharesLoading,
    redemptionCompleted,
    redemptionLoading,
    claimCompleted,
    claimLoading,
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
      vaultUserSnapshot,
      vaultSymbol: vaultSnapshot.symbol,
      vaultOption,
      balances,
      isClaimOnly,
    })
    setRequiredApprovals(requiredApprovals)
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
  const handleSharesApproval = async () => {
    setTransactionState((prevState) => ({ ...prevState, approveSharesLoading: true }))
    try {
      await onApproveShares()
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
      await onDeposit(bigintAmount)
      setTransactionState((prevState) => ({ ...prevState, depositCompleted: true }))
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, depositLoading: false }))
    }
  }

  const handleRedemption = async () => {
    setTransactionState((prevState) => ({ ...prevState, redemptionLoading: true }))
    try {
      await onRedeem(bigintAmount, { max: maxWithdrawal || bigintAmount === vaultUserSnapshot.assets })
      setTransactionState((prevState) => ({ ...prevState, redemptionCompleted: true }))
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, redemptionLoading: false }))
    }
  }

  const handleApproveDSU = async () => {
    setTransactionState((prevState) => ({ ...prevState, approveDSULoading: true }))
    try {
      await onApproveDSU()
      setTransactionState((prevState) => ({ ...prevState, approveDSUCompleted: true }))
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, approveDSULoading: false }))
    }
  }

  const handleClaim = async () => {
    setTransactionState((prevState) => ({ ...prevState, claimLoading: true }))
    try {
      await onClaim(vaultUserSnapshot.claimable)
      setTransactionState((prevState) => ({ ...prevState, claimCompleted: true }))
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, claimLoading: false }))
    }
  }

  const requiresUSDCApproval = requiredApprovals?.includes(RequiredApprovals.usdc)
  const requiresSharesApproval = requiredApprovals?.includes(RequiredApprovals.shares)
  const requiresDSUApproval = requiredApprovals?.includes(RequiredApprovals.dsu)
  const formattedClaimableBalance = formatBig18USDPrice(vaultUserSnapshot.claimable)
  const approximateShares = formatBig18(
    Big18Math.div(Big18Math.mul(bigintAmount, vaultSnapshot.totalSupply), vaultSnapshot.totalAssets),
  )
  const dsuApprovalSuggestion = formatBig18USDPrice(
    Big18Math.add(parseEther('0.01'), vaultUserSnapshot.claimable ? vaultUserSnapshot.claimable ?? 0n : bigintAmount),
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
                {!isClaimOnly && hasAssets && requiresSharesApproval && (
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
                {!isClaimOnly && hasAssets && (
                  <ModalStep
                    title={copy.redeemShares}
                    description={intl.formatMessage(
                      { defaultMessage: 'Redeem funds from {vaultName} vault' },
                      { vaultName },
                    )}
                    isLoading={redemptionLoading}
                    isCompleted={redemptionCompleted}
                  />
                )}
                {positionUpdating && !isClaimOnly && (
                  <ModalStep
                    title={copy.positionUpdating}
                    description={copy.positionUpdatingBody}
                    isLoading={positionUpdating}
                    isCompleted={redemptionCompleted && !positionUpdating}
                  />
                )}
                {requiresDSUApproval && (
                  <ModalStep
                    title={copy.approveDSU}
                    description={intl.formatMessage(
                      { defaultMessage: 'Approve {dsuApprovalSuggestion} DSU to withdraw collateral' },
                      { dsuApprovalSuggestion },
                    )}
                    isLoading={approveDSULoading}
                    isCompleted={approveDSUCompleted}
                  />
                )}
                <ModalStep
                  title={copy.claimShares}
                  description={
                    isClaimOnly
                      ? intl.formatMessage(
                          { defaultMessage: '{claimableBalance} available for withdrawal' },
                          { claimableBalance: formattedClaimableBalance },
                        )
                      : intl.formatMessage({ defaultMessage: 'Claim funds from {vaultName} vault' }, { vaultName })
                  }
                  isLoading={claimLoading}
                  isCompleted={claimCompleted}
                />

                <ModalDetail
                  title={copy.withdrawFromVault}
                  action={copy.Withdraw}
                  color={colors.brand.purple[240]}
                  detail={intl.formatMessage(
                    { defaultMessage: '{amount} from {vaultName}' },
                    {
                      amount: hasClaimable ? formattedClaimableBalance : formattedAmount,
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
                {!isClaimOnly && hasAssets && (
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
                        (requiresSharesApproval && !approveSharesCompleted) || redemptionCompleted
                          ? 'outline'
                          : 'primary'
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
                {requiresDSUApproval && (
                  <Button
                    variant={
                      hasClaimable && !approveDSUCompleted
                        ? 'primary'
                        : (requiresSharesApproval && !approveSharesCompleted) ||
                          approveDSUCompleted ||
                          (!hasClaimable && !redemptionCompleted)
                        ? 'outline'
                        : 'primary'
                    }
                    isDisabled={
                      (requiresSharesApproval && !approveSharesCompleted) ||
                      (!hasClaimable && !redemptionCompleted) ||
                      approveDSULoading ||
                      (!isClaimOnly && positionUpdating) ||
                      approveDSUCompleted
                    }
                    label={approveDSULoading ? <Spinner size="sm" /> : copy.approveDSU}
                    onClick={handleApproveDSU}
                    width="100%"
                  />
                )}
                <Button
                  variant={
                    (requiresDSUApproval && !approveDSUCompleted) ||
                    !hasClaimable ||
                    (!hasClaimable && !redemptionCompleted)
                      ? 'outline'
                      : 'primary'
                  }
                  isDisabled={
                    (requiresDSUApproval && !approveDSUCompleted) ||
                    claimLoading ||
                    claimCompleted ||
                    (!isClaimOnly && positionUpdating) ||
                    (!hasClaimable && !redemptionCompleted)
                  }
                  label={claimLoading ? <Spinner size="sm" /> : copy.claimShares}
                  onClick={handleClaim}
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
