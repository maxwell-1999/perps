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

import { ModalDetail, ModalStep } from '@/components/shared/ModalComponents'
import { VaultSnapshot, VaultUserSnapshot } from '@/constants/vaults'
import { useVaultTransactions } from '@/hooks/vaults'
import { Balances } from '@/hooks/wallet'
import { Big18Math } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { FormValues, RequiredApprovals, VaultFormOption } from './constants'
import { useVaultFormCopy } from './hooks'
import { getRequiredApprovals } from './utils'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onCancel: () => void
  vaultOption: VaultFormOption
  balances: Balances
  formValues: FormValues
  vaultName: string
  vaultSnapshot: VaultSnapshot
  vaultUserSnapshot: VaultUserSnapshot
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onCancel,
  vaultOption,
  balances,
  formValues,
  vaultSnapshot,
  vaultName,
  vaultUserSnapshot,
}: ConfirmationModalProps) {
  const copy = useVaultFormCopy()
  const intl = useIntl()
  const { onApproveUSDC, onApproveShares, onDeposit, onRedeem, onClaim, onApproveDSU } = useVaultTransactions(
    vaultSnapshot.symbol,
  )
  const bigintAmount = Big18Math.fromFloatString(formValues.amount)
  const [requiredApprovals, setRequiredApprovals] = useState<RequiredApprovals[]>()
  const [approveUSDCLoading, setApproveUSDCLoading] = useState<boolean>(false)
  const [approveUSDCCompleted, setApproveUSDCCompleted] = useState<boolean>(false)
  const [depositLoading, setDepositLoading] = useState<boolean>(false)
  const [depositCompleted, setDepositCompleted] = useState<boolean>(false)
  const [approveSharesLoading, setApproveSharesLoading] = useState<boolean>(false)
  const [approveSharesCompleted, setApproveSharesCompleted] = useState<boolean>(false)
  const [redemptionLoading, setRedemptionLoading] = useState<boolean>(false)
  const [redemptionCompleted, setRedemptionCompleted] = useState<boolean>(false)
  const [approveDSULoading, setApproveDSULoading] = useState<boolean>(false)
  const [approveDSUCompleted, setApproveDSUCompleted] = useState<boolean>(false)
  const [claimLoading, setClaimLoading] = useState<boolean>(false)
  const [claimCompleted, setClaimCompleted] = useState<boolean>(false)

  const isDeposit = vaultOption === VaultFormOption.Deposit
  const formattedAmount = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(formValues.amount))

  useEffect(() => {
    const requiredApprovals = getRequiredApprovals({
      amount: bigintAmount,
      vaultSymbol: vaultSnapshot.symbol,
      vaultOption,
      balances,
      claimable: vaultUserSnapshot.claimable,
      totalSupply: vaultSnapshot.totalSupply,
      totalAssets: vaultSnapshot.totalAssets,
    })
    setRequiredApprovals(requiredApprovals)
  }, [])

  const handleUSDCApproval = async () => {
    setApproveUSDCLoading(true)
    try {
      await onApproveUSDC()
      setApproveUSDCCompleted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setApproveUSDCLoading(false)
    }
  }
  const handleSharesApproval = async () => {
    setApproveSharesLoading(true)
    try {
      await onApproveShares()
      setApproveSharesCompleted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setApproveSharesLoading(false)
    }
  }

  const handleDeposit = async () => {
    setDepositLoading(true)
    try {
      await onDeposit(bigintAmount)
      setDepositCompleted(true)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setDepositLoading(false)
    }
  }

  const handleRedemption = async () => {
    setRedemptionLoading(true)
    try {
      await onRedeem(bigintAmount, { max: bigintAmount === vaultUserSnapshot.assets })
      setRedemptionCompleted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setRedemptionLoading(false)
    }
  }

  const handleApproveDSU = async () => {
    setApproveDSULoading(true)
    try {
      await onApproveDSU()
      setApproveDSUCompleted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setApproveDSULoading(false)
    }
  }

  const handleClaim = async () => {
    setClaimLoading(true)
    try {
      await onClaim(vaultUserSnapshot.claimable)
      setClaimCompleted(true)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setClaimLoading(false)
    }
  }

  const requiresUSDCApproval = requiredApprovals?.includes(RequiredApprovals.usdc)
  const requiresSharesApproval = requiredApprovals?.includes(RequiredApprovals.shares)
  const requiresDSUApproval = requiredApprovals?.includes(RequiredApprovals.dsu)
  const hasClaimable = vaultUserSnapshot.claimable > 0n

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered variant="confirmation">
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
                    isLoading={requiresUSDCApproval ? approveUSDCLoading : false}
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
                    description={copy.approveSharesBody}
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
                {requiresDSUApproval && (
                  <ModalStep
                    title={copy.approveDSU}
                    description={copy.approveDSUBody}
                    isLoading={approveDSULoading}
                    isCompleted={approveDSUCompleted}
                  />
                )}
                <ModalStep
                  title={copy.claimShares}
                  description={intl.formatMessage(
                    { defaultMessage: 'Claim funds from {vaultName} vault' },
                    { vaultName },
                  )}
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
                    label={
                      approveUSDCCompleted ? (
                        <Spinner size="sm" />
                      ) : isDeposit ? (
                        copy.approveUSDC
                      ) : (
                        copy.approveVaultDeposits
                      )
                    }
                    onClick={handleUSDCApproval}
                    width="100%"
                  />
                )}
                <Button
                  variant={requiresUSDCApproval && !approveUSDCCompleted ? 'outline' : 'primary'}
                  isDisabled={(requiresUSDCApproval && !approveUSDCCompleted) || depositLoading || depositCompleted}
                  label={depositLoading ? <Spinner size="sm" /> : copy.DepositToVault}
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
                  variant={requiresSharesApproval && !approveSharesCompleted ? 'outline' : 'primary'}
                  isDisabled={
                    (requiresSharesApproval && !approveSharesCompleted) || redemptionLoading || redemptionCompleted
                  }
                  label={redemptionLoading ? <Spinner size="sm" /> : copy.redeemShares}
                  onClick={handleRedemption}
                  width="100%"
                />
                {requiresDSUApproval && (
                  <Button
                    variant={
                      approveDSUCompleted || (requiresDSUApproval && !approveDSUCompleted) ? 'outline' : 'primary'
                    }
                    isDisabled={
                      (requiresSharesApproval && !approveSharesCompleted) ||
                      !redemptionCompleted ||
                      approveDSULoading ||
                      approveDSUCompleted
                    }
                    label={approveDSULoading ? <Spinner size="sm" /> : copy.approveDSU}
                    onClick={handleApproveDSU}
                    width="100%"
                  />
                )}
                <Button
                  variant={(requiresDSUApproval && !approveDSUCompleted) || !hasClaimable ? 'outline' : 'primary'}
                  isDisabled={(requiresDSUApproval && !approveDSUCompleted) || claimLoading || claimCompleted}
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
