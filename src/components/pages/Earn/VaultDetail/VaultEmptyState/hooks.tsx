import { useToast } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import Toast, { ToastMessage } from '@/components/shared/Toast'
import { MultiInvokerAddresses } from '@/constants/contracts'
import { PerennialVaultType, SupportedVaults } from '@/constants/vaults'
import { useDSU } from '@/hooks/contracts'
import { useAddress, useChainId } from '@/hooks/network'
import { VaultUserSnapshot } from '@/hooks/vaults'
import { Big18Math } from '@/utils/big18Utils'
import { getVaultForTypeV1 } from '@/utils/contractUtils'

import { useVaultDetailCopy } from '../hooks'

export const useEmtpyStateCopy = () => {
  const intl = useIntl()
  return {
    title1: intl.formatMessage({ defaultMessage: 'Migrate positions' }),
    title2: intl.formatMessage({ defaultMessage: 'from v1' }),
    body: intl.formatMessage({
      defaultMessage: 'You have active vault positions open on the previous version of Perennial. Migrate them now.',
    }),
    executeMigrations: intl.formatMessage({ defaultMessage: 'Execute migrations' }),
    migrationSubheader: intl.formatMessage({
      defaultMessage:
        'Follow the steps below for each vault you would like to migrate in order to transfer your liquidity from v1 to v2.',
    }),
    cancel: intl.formatMessage({ defaultMessage: 'Cancel' }),
    balance: intl.formatMessage({ defaultMessage: 'Balance:' }),
    positions: intl.formatMessage({ defaultMessage: 'Positions:' }),
    migrationStep1: intl.formatMessage({ defaultMessage: 'Approve & redeem shares' }),
    step1Subheader: intl.formatMessage({ defaultMessage: 'Allow Perennial to redeem your LP shares on v1' }),
    migrationStep2: intl.formatMessage({ defaultMessage: 'Claim your redeemed LP shares from v1' }),
    step2Subheader: intl.formatMessage({ defaultMessage: 'Claim your redeemed LP shares from v1' }),
    migrationStep3: intl.formatMessage({ defaultMessage: 'Select market to migrate to' }),
    step3Subheader: intl.formatMessage({ defaultMessage: 'Determine which market to migrate your liquidity to' }),
    redeemFunds: intl.formatMessage({ defaultMessage: 'Redeem funds' }),
    claimFunds: intl.formatMessage({ defaultMessage: 'Claim funds' }),
    claimable: intl.formatMessage({ defaultMessage: 'Claimable:' }),
    availableForDeposit: intl.formatMessage({ defaultMessage: 'Available for deposit:' }),
    deposit: intl.formatMessage({ defaultMessage: 'Deposit' }),
    insufficientApprovalSharesMsg: (shares: React.ReactNode) =>
      intl.formatMessage({ defaultMessage: 'You must approve at least {shares}' }, { shares }),
    insufficientDSUApprovalMsg: (claimable: React.ReactNode) =>
      intl.formatMessage({ defaultMessage: 'You must approve at least {claimable}' }, { claimable }),
  }
}

export const useV1Balances = () => {
  const chainId = useChainId()
  const { address } = useAddress()
  const dsuContract = useDSU()

  return useQuery({
    queryKey: ['v1Balances', chainId, address],
    enabled: !!address,
    queryFn: async () => {
      if (!address || !chainId) return

      const [alphaVaultAllowance, bravoVaultAllowance] = await Promise.all(
        Object.values(PerennialVaultType).map((vaultType) => {
          const vaultContract = getVaultForTypeV1(vaultType, chainId)
          if (!vaultContract) return Promise.resolve(null)
          return vaultContract.read.allowance([address, MultiInvokerAddresses[chainId]])
        }),
      )
      // Map vault allowances to vault symbol
      const sharesAllowance = Object.keys(SupportedVaults[chainId])
        .filter((vaultType) => SupportedVaults[chainId][vaultType as PerennialVaultType])
        .reduce<{ [key in PerennialVaultType]?: bigint }>((acc, vaultType) => {
          return {
            ...acc,
            [vaultType]: vaultType === PerennialVaultType.alpha ? alphaVaultAllowance : bravoVaultAllowance,
          }
        }, {})

      const dsuAllowance = await dsuContract.read.allowance([address, MultiInvokerAddresses[chainId]])

      return { sharesAllowance, dsuAllowance }
    },
  })
}

export const useV1VaultSettledToast = ({
  selectedVault,
  prevSelectedVault,
  vaultUserSnapshot,
  prevVaultUserSnapshot,
}: {
  selectedVault?: PerennialVaultType
  prevSelectedVault?: PerennialVaultType
  vaultUserSnapshot?: VaultUserSnapshot
  prevVaultUserSnapshot?: VaultUserSnapshot
}) => {
  const toast = useToast()
  const copy = useVaultDetailCopy()
  const positionUpdating = Boolean(vaultUserSnapshot && !Big18Math.isZero(vaultUserSnapshot.pendingRedemptionAmount))
  const prevPositionUpdating = Boolean(
    prevVaultUserSnapshot && !Big18Math.isZero(prevVaultUserSnapshot.pendingRedemptionAmount),
  )
  const isSameVault = vaultUserSnapshot && prevVaultUserSnapshot && selectedVault === prevSelectedVault

  useEffect(() => {
    if (isSameVault && prevPositionUpdating && !positionUpdating) {
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.positionSettled}
            onClose={onClose}
            body={<ToastMessage message={copy.yourPositionHasSettled} />}
          />
        ),
      })
    }
  }, [positionUpdating, prevPositionUpdating, copy, toast, isSameVault])
}
