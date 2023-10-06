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
import { VaultSnapshot, VaultUserSnapshot, useVaultTransactions } from '@/hooks/vaults'
import { Big18Math, formatBig18, formatBig18USDPrice } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { useVaultFormCopy } from '../../VaultForm/hooks'
import { useEmtpyStateCopy } from '../hooks'
import { getRequiresShareApproval } from '../utils'

interface RedeemModalProps {
  onClose: () => void
  vaultSnapshot: VaultSnapshot
  vaultUserSnapshot: VaultUserSnapshot
  sharesAllowance: {
    alpha?: bigint | undefined
    bravo?: bigint | undefined
  }
  vaultName: string
}

export default function RedeemModal({
  onClose,
  sharesAllowance,
  vaultSnapshot,
  vaultUserSnapshot,
  vaultName,
}: RedeemModalProps) {
  const copy = useVaultFormCopy()
  const { insufficientApprovalSharesMsg } = useEmtpyStateCopy()
  const intl = useIntl()
  const toast = useToast()
  const { track } = useMixpanel()

  const { onApproveShares, onRedeem } = useVaultTransactions(vaultSnapshot.vaultType)

  const assets = vaultUserSnapshot?.assets ?? 0n

  const [requiresShareApproval, setRequiresShareApproval] = useState<boolean>(true)
  const [insufficientApproval, setInsufficientApproval] = useState<boolean>(false)

  const [transactionState, setTransactionState] = useState<TransactionState>(initialTransactionState)
  const { approveSharesCompleted, approveSharesLoading, redemptionCompleted, redemptionLoading } = transactionState

  const formattedAmount = formatBig18USDPrice(assets)
  const approximateShares = Big18Math.mul(
    Big18Math.div(Big18Math.mul(assets, vaultSnapshot.totalSupply), vaultSnapshot.totalAssets),
    Big18Math.fromFloatString('1.05'),
  )

  useEffect(() => {
    const requiresApproval = getRequiresShareApproval({
      assets,
      vaultSnapshot,
      sharesAllowance,
    })
    setRequiresShareApproval(requiresApproval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSharesApproval = async () => {
    setTransactionState((prevState) => ({ ...prevState, approveSharesLoading: true }))
    try {
      const data = await onApproveShares()
      if (data?.newAllowance && data?.newAllowance >= approximateShares) {
        setInsufficientApproval(false)
        setTransactionState((prevState) => ({ ...prevState, approveSharesCompleted: true }))
      } else {
        setInsufficientApproval(true)
        setTransactionState((prevState) => ({
          ...prevState,
          approveSharesCompleted: false,
        }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, approveSharesLoading: false }))
    }
  }

  const handleRedemption = async () => {
    setTransactionState((prevState) => ({ ...prevState, redemptionLoading: true }))
    try {
      await onRedeem(assets, { max: true })
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
      track(TrackingEvents.redeemV1VaultShares, {
        amount: Big18Math.toFloatString(assets),
        vaultName,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setTransactionState((prevState) => ({ ...prevState, redemptionLoading: false }))
    }
  }

  return (
    <Modal isOpen onClose={onClose} isCentered variant="confirmation">
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Flex direction="column" maxWidth="350px">
            <Text fontSize="18px" mb={1}>
              {copy.confirmWithdraw}
            </Text>
            <Text variant="label" fontSize="13px" mb={5}>
              {copy.confirmWithdrawBody}
            </Text>

            {requiresShareApproval && (
              <ModalStep
                title={copy.approveShares}
                description={
                  insufficientApproval
                    ? insufficientApprovalSharesMsg(
                        <Text as="span" color={colors.brand.purple[240]}>
                          {formatBig18(approximateShares)} {copy.shares}
                        </Text>,
                      )
                    : intl.formatMessage(
                        { defaultMessage: 'Approve at least {approximateShares} to redeem your funds' },
                        {
                          approximateShares: (
                            <Text as="span" color={colors.brand.purple[240]}>
                              {formatBig18(approximateShares)} {copy.shares}
                            </Text>
                          ),
                        },
                      )
                }
                isLoading={approveSharesLoading}
                isCompleted={approveSharesCompleted}
              />
            )}
            <ModalStep
              title={copy.redeemShares}
              description={intl.formatMessage(
                { defaultMessage: 'Redeem funds from {vaultName} vault' },
                { vaultName: vaultName },
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
                  vaultName: vaultName,
                },
              )}
            />
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="initial">
          <VStack flex={1}>
            {requiresShareApproval && (
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
                (requiresShareApproval && !approveSharesCompleted) || redemptionCompleted ? 'outline' : 'primary'
              }
              isDisabled={
                (requiresShareApproval && !approveSharesCompleted) || redemptionLoading || redemptionCompleted
              }
              label={redemptionLoading ? <Spinner size="sm" /> : copy.redeemShares}
              onClick={handleRedemption}
              width="100%"
            />
            <Button variant="secondary" onClick={onClose} label={copy.cancel} width="100%" />
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

type TransactionState = {
  approveSharesLoading: boolean
  approveSharesCompleted: boolean
  redemptionLoading: boolean
  redemptionCompleted: boolean
}

const initialTransactionState: TransactionState = {
  approveSharesLoading: false,
  approveSharesCompleted: false,
  redemptionLoading: false,
  redemptionCompleted: false,
}
