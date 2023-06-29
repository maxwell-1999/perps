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
import { parseEther } from 'viem'

import { ModalDetail, ModalStep } from '@/components/shared/ModalComponents'
import Toast, { ToastMessage } from '@/components/shared/Toast'
import { VaultSnapshot, VaultUserSnapshot, useVaultTransactions } from '@/hooks/vaults'
import { Balances } from '@/hooks/wallet'
import { Big18Math, formatBig18USDPrice } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { ClaimTxState, initialTransactionState } from './constants'
import { useClaimModalCopy } from './hooks'

interface ClaimModalProps {
  onClose: () => void
  vaultName: string
  vaultSnapshot: VaultSnapshot
  vaultUserSnapshot: VaultUserSnapshot
  balances?: Balances
}

export default function ClaimModal({
  onClose,
  vaultSnapshot,
  vaultName,
  vaultUserSnapshot,
  balances,
}: ClaimModalProps) {
  const copy = useClaimModalCopy()
  const intl = useIntl()
  const toast = useToast()
  const { onClaim, onApproveDSU } = useVaultTransactions(vaultSnapshot.symbol)
  const formattedClaimableBalance = formatBig18USDPrice(vaultUserSnapshot.claimable)

  const [requiresDSUApproval, setRequiresDSUApproval] = useState<boolean>(false)

  const [transactionState, setTransactionState] = useState<ClaimTxState>(initialTransactionState)
  const { approveDSUCompleted, approveDSULoading, claimCompleted, claimLoading } = transactionState

  useEffect(() => {
    const dsuAllowance = balances?.dsuAllowance ?? 0n
    const requiresDSUApproval = vaultUserSnapshot.claimable > dsuAllowance
    setRequiresDSUApproval(requiresDSUApproval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      const message = copy.claimToast(formattedClaimableBalance)
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.collateralWithdrawn}
            onClose={onClose}
            body={<ToastMessage action={copy.Withdraw} actionColor={colors.brand.green} message={message} />}
          />
        ),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, claimLoading: false }))
    }
  }

  const dsuApprovalSuggestion = formatBig18USDPrice(Big18Math.add(parseEther('0.01'), vaultUserSnapshot.claimable))

  return (
    <Modal isOpen onClose={onClose} isCentered variant="confirmation">
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Flex direction="column" maxWidth="350px">
            <Text fontSize="18px" mb={1}>
              {copy.title}
            </Text>
            <Text variant="label" fontSize="13px" mb={5}>
              {copy.modalBody}
            </Text>
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
              title={copy.withdrawAssets}
              description={intl.formatMessage(
                { defaultMessage: '{claimableBalance} available for withdrawal' },
                { claimableBalance: formattedClaimableBalance },
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
                  amount: formattedClaimableBalance,
                  vaultName,
                },
              )}
            />
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="initial">
          <VStack flex={1}>
            <>
              {requiresDSUApproval && (
                <Button
                  variant={!approveDSUCompleted ? 'primary' : 'outline'}
                  isDisabled={approveDSULoading || approveDSUCompleted}
                  label={approveDSULoading ? <Spinner size="sm" /> : copy.approveDSU}
                  onClick={handleApproveDSU}
                  width="100%"
                />
              )}
              <Button
                variant={requiresDSUApproval && !approveDSUCompleted ? 'outline' : 'primary'}
                isDisabled={requiresDSUApproval && !approveDSUCompleted}
                label={claimLoading ? <Spinner size="sm" /> : copy.withdrawAssets}
                onClick={handleClaim}
                width="100%"
              />
            </>
            <Button variant="secondary" onClick={onClose} label={copy.cancel} width="100%" />
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
