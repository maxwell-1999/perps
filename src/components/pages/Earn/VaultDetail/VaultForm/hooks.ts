import { useCallback, useMemo } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Big6Math } from '@/utils/big6Utils'
import { isNumbersOnly } from '@/utils/formUtils'

import { FormNames, FormValues, VaultFormOption } from './constants'

export function useVaultFormCopy() {
  const intl = useIntl()

  return {
    Deposit: intl.formatMessage({ defaultMessage: 'Deposit' }),
    Redeem: intl.formatMessage({ defaultMessage: 'Redeem' }),
    Amount: intl.formatMessage({ defaultMessage: 'Amount' }),
    ChangeInValue: intl.formatMessage({ defaultMessage: 'Change in Value' }),
    SettlementFee: intl.formatMessage({ defaultMessage: 'Settlement Fee' }),
    ChangeInPnL: intl.formatMessage({ defaultMessage: 'Change in P&L' }),
    zeroUsd: intl.formatMessage({ defaultMessage: '$0.00' }),
    max: intl.formatMessage({ defaultMessage: 'Max' }),
    confirmDeposit: intl.formatMessage({ defaultMessage: 'Confirm deposit' }),
    confirmWithdraw: intl.formatMessage({ defaultMessage: 'Confirm redemption' }),
    confirmWithdrawBody: intl.formatMessage({
      defaultMessage: 'Please check your wallet, and confirm the following request to redeem your funds.',
    }),
    confirmDepositBody: intl.formatMessage({
      defaultMessage: 'Please check your wallet, and confirm the following request to deposit funds.',
    }),
    approveUSDC: intl.formatMessage({ defaultMessage: 'Approve USDC' }),
    approveVaultDeposits: intl.formatMessage({ defaultMessage: 'Approve Vault Deposits' }),
    approveUSDCBody: intl.formatMessage({ defaultMessage: "Approve funds for Perennial's vaults." }),
    approveVaultDepositsBody: intl.formatMessage({
      defaultMessage: 'Approve vault deposits for withdrawal',
    }),
    depositCollateral: intl.formatMessage({ defaultMessage: 'Deposit collateral' }),
    addToVault: intl.formatMessage({ defaultMessage: 'Add to vault' }),
    withdrawCollateral: intl.formatMessage({ defaultMessage: 'Withdraw collateral' }),
    redeemFromVault: intl.formatMessage({ defaultMessage: 'Redeem from vault' }),
    cancel: intl.formatMessage({ defaultMessage: 'Cancel' }),
    approveOperator: intl.formatMessage({ defaultMessage: 'Approve operator' }),
    approveOperatorBody: intl.formatMessage({ defaultMessage: 'Approve operator to deposit to vault' }),
    redeemShares: intl.formatMessage({ defaultMessage: 'Redeem shares' }),
    claimShares: intl.formatMessage({ defaultMessage: 'Claim shares' }),
    noValue: intl.formatMessage({ defaultMessage: '——' }),
    insufficientFunds: intl.formatMessage({ defaultMessage: 'Insufficient funds' }),
    insufficientShares: intl.formatMessage({ defaultMessage: 'Insufficient shares' }),
    collateralDeposited: intl.formatMessage({ defaultMessage: 'Collateral deposited' }),
    assetsRedeemed: intl.formatMessage({ defaultMessage: 'Vault assets redeemed' }),
    shares: intl.formatMessage({ defaultMessage: 'shares' }),
    redeemToast: (amount: string, vaultName: string) =>
      intl.formatMessage({ defaultMessage: '{amount} from {vaultName}' }, { amount, vaultName }),
    depositToast: (amount: string, vaultName: string) =>
      intl.formatMessage({ defaultMessage: '{amount} to {vaultName}' }, { amount, vaultName }),
    requiredField: intl.formatMessage({ defaultMessage: 'This field is required.' }),
    approveShares: intl.formatMessage({ defaultMessage: 'Approve shares' }),
  }
}

export function useVaultFormValidators({
  usdcBalance,
  vaultAssets,
  vaultFormOption,
}: {
  usdcBalance: bigint
  vaultAssets: bigint
  vaultFormOption: VaultFormOption
}) {
  const copy = useVaultFormCopy()
  const maxValidator = useMemo(() => {
    if (vaultFormOption === VaultFormOption.Deposit) {
      return (value: string) => {
        const inputValue = Big6Math.fromFloatString(value)
        const balance = Big6Math.fromDecimals(usdcBalance, 6)
        if (inputValue > balance) {
          return copy.insufficientFunds
        }
        return true
      }
    } else {
      return (value: string) => {
        const inputValue = Big6Math.fromFloatString(value)
        if (inputValue > vaultAssets) {
          return copy.insufficientShares
        }
        return true
      }
    }
  }, [usdcBalance, vaultAssets, vaultFormOption, copy.insufficientFunds, copy.insufficientShares])

  const isRequiredValidator = useMemo(() => {
    return (value: string) => {
      return value && value.trim() !== '' ? true : copy.requiredField
    }
  }, [copy.requiredField])

  return { max: maxValidator, required: isRequiredValidator }
}

const setArgs = { shouldValidate: true, shouldDirty: true }

export const useOnAmountChange = (setValue: UseFormSetValue<FormValues>) =>
  useCallback(
    (newAmount: string) => {
      if (!isNumbersOnly(newAmount)) return
      const validatedAmount = Big6Math.max6Decimals(newAmount)
      setValue(FormNames.amount, validatedAmount, setArgs)
    },
    [setValue],
  )
