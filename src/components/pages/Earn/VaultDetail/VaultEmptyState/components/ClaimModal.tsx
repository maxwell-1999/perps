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
import { useMigrationContext } from '@/contexts/migrationContext'
import { VaultSnapshot, VaultUserSnapshot, useVaultTransactions } from '@/hooks/vaults'
import { Big18Math, formatBig18, formatBig18USDPrice } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { useClaimModalCopy } from '../../ClaimModal/hooks'
import { useEmtpyStateCopy } from '../hooks'

interface ClaimModalProps {
  onClose: () => void
  vaultName: string
  vaultSnapshot: VaultSnapshot
  vaultUserSnapshot: VaultUserSnapshot
  dsuAllowance?: bigint
}

export default function ClaimModal({
  onClose,
  vaultSnapshot,
  vaultName,
  vaultUserSnapshot,
  dsuAllowance,
}: ClaimModalProps) {
  const copy = useClaimModalCopy()
  const { insufficientDSUApprovalMsg } = useEmtpyStateCopy()
  const intl = useIntl()
  const toast = useToast()
  const { track } = useMixpanel()
  const { withdrawnAmount, setWithdrawnAmount } = useMigrationContext()
  const { onClaim, onApproveDSU } = useVaultTransactions(vaultSnapshot.vaultType)
  const formattedClaimableBalance = formatBig18USDPrice(vaultUserSnapshot.claimable)

  const [requiresDSUApproval, setRequiresDSUApproval] = useState<boolean>(false)
  const [insuficientDSUApproval, setInsuficientDSUApproval] = useState<boolean>(false)

  const [transactionState, setTransactionState] = useState<ClaimTxState>(initialTransactionState)
  const { approveDSUCompleted, approveDSULoading, claimCompleted, claimLoading } = transactionState

  useEffect(() => {
    const requiresDSUApproval = vaultUserSnapshot.claimable > (dsuAllowance ?? 0n)
    setRequiresDSUApproval(requiresDSUApproval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApproveDSU = async () => {
    setTransactionState((prevState) => ({ ...prevState, approveDSULoading: true }))
    try {
      const { newAllowance } = await onApproveDSU()
      if (newAllowance >= vaultUserSnapshot.claimable) {
        setInsuficientDSUApproval(false)
        setTransactionState((prevState) => ({ ...prevState, approveDSUCompleted: true }))
      } else {
        setInsuficientDSUApproval(true)
        setTransactionState((prevState) => ({ ...prevState, approveDSUCompleted: false }))
      }
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
      setWithdrawnAmount(vaultUserSnapshot.claimable + withdrawnAmount)
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
      track(TrackingEvents.claimV1VaultRewards, {
        vaultName,
        amount: Big18Math.toFloatString(vaultUserSnapshot.claimable),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, claimLoading: false }))
    }
  }

  const dsuApprovalSuggestion = formatBig18(
    Big18Math.add(Big18Math.fromFloatString('0.01'), vaultUserSnapshot.claimable),
    { minDecimals: 2 },
  )

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
                description={
                  insuficientDSUApproval
                    ? insufficientDSUApprovalMsg(
                        <Text as="span" color={colors.brand.purple[240]}>
                          {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                          {dsuApprovalSuggestion} DSU
                        </Text>,
                      )
                    : intl.formatMessage(
                        { defaultMessage: 'Approve at least {dsuApprovalSuggestion} to withdraw collateral' },
                        {
                          dsuApprovalSuggestion: (
                            <Text as="span" color={colors.brand.purple[240]}>
                              {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                              {dsuApprovalSuggestion} DSU
                            </Text>
                          ),
                        },
                      )
                }
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

export type ClaimTxState = {
  approveDSULoading: boolean
  approveDSUCompleted: boolean
  claimLoading: boolean
  claimCompleted: boolean
}

export const initialTransactionState: ClaimTxState = {
  approveDSULoading: false,
  approveDSUCompleted: false,
  claimLoading: false,
  claimCompleted: false,
}
