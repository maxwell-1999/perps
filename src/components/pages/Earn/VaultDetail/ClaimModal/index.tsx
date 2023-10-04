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
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { TrackingEvents, useMixpanel } from '@/analytics'
import { ModalDetail, ModalStep } from '@/components/shared/ModalComponents'
import Toast, { ToastMessage } from '@/components/shared/Toast'
import { StaleAfterMessage } from '@/components/shared/components'
import { useVaultTransactions } from '@/hooks/vaults2'
import { VaultAccountSnapshot2, VaultSnapshot2 } from '@/hooks/vaults2'
import { Big6Math, formatBig6USDPrice } from '@/utils/big6Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { ClaimTxState, initialTransactionState } from './constants'
import { useClaimModalCopy } from './hooks'

interface ClaimModalProps {
  onClose: () => void
  vaultName: string
  vaultSnapshot: VaultSnapshot2
  vaultUserSnapshot: VaultAccountSnapshot2
}

export default function ClaimModal({ onClose, vaultSnapshot, vaultName, vaultUserSnapshot }: ClaimModalProps) {
  const copy = useClaimModalCopy()
  const intl = useIntl()
  const toast = useToast()
  const { track } = useMixpanel()
  const { onClaim } = useVaultTransactions(vaultSnapshot.vault)
  const claimable = vaultUserSnapshot.accountData.assets - vaultSnapshot.totalSettlementFee
  const formattedClaimableBalance = formatBig6USDPrice(claimable)

  const [transactionState, setTransactionState] = useState<ClaimTxState>(initialTransactionState)

  const handleClaim = async () => {
    setTransactionState((prevState) => ({ ...prevState, claimLoading: true }))
    try {
      const receipt = await onClaim()
      if (receipt?.status === 'success') {
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
        track(TrackingEvents.withdrawFromVault, {
          vaultName,
          amount: Big6Math.toFloatString(claimable),
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, claimLoading: false }))
    }
  }

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
            <ModalStep
              title={copy.withdrawAssets}
              description={intl.formatMessage(
                { defaultMessage: '{claimableBalance} available for withdrawal' },
                { claimableBalance: formattedClaimableBalance },
              )}
              isLoading={transactionState.claimLoading}
              isCompleted={transactionState.claimCompleted}
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
            <StaleAfterMessage
              staleAfter={Big6Math.min(
                ...vaultSnapshot.marketSnapshots.map((marketSnapshot) => marketSnapshot.riskParameter.staleAfter),
              ).toString()}
            />
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="initial">
          <VStack flex={1}>
            <>
              <Button
                variant="primary"
                label={transactionState.claimLoading ? <Spinner size="sm" /> : copy.withdrawAssets}
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
