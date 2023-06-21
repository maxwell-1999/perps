import { useCallback, useMemo } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Big18Math } from '@/utils/big18Utils'
import { isNumbersOnly } from '@/utils/formUtils'

import { FormNames, FormValues, VaultFormOption } from './constants'

export function useVaultFormCopy() {
  const intl = useIntl()

  return {
    Deposit: intl.formatMessage({ defaultMessage: 'Deposit' }),
    Withdraw: intl.formatMessage({ defaultMessage: 'Withdraw' }),
    Amount: intl.formatMessage({ defaultMessage: 'Amount' }),
    ChangeInValue: intl.formatMessage({ defaultMessage: 'Change in Value' }),
    ChangeInPnL: intl.formatMessage({ defaultMessage: 'Change in P&L' }),
    DepositToVault: intl.formatMessage({ defaultMessage: 'Deposit to vault' }),
    WithdrawFromVault: intl.formatMessage({ defaultMessage: 'Withdraw from vault' }),
    zeroUsd: intl.formatMessage({ defaultMessage: '$0.00' }),
    max: intl.formatMessage({ defaultMessage: 'Max' }),
    confirmDeposit: intl.formatMessage({ defaultMessage: 'Confirm deposit' }),
    confirmWithdraw: intl.formatMessage({ defaultMessage: 'Confirm withdraw' }),
    confirmWithdrawBody: intl.formatMessage({
      defaultMessage: 'Please check your wallet, and confirm the following request to withdraw funds.',
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
    withdrawFromVault: intl.formatMessage({ defaultMessage: 'Withdraw from vault' }),
    cancel: intl.formatMessage({ defaultMessage: 'Cancel' }),
    approveShares: intl.formatMessage({ defaultMessage: 'Approve shares' }),
    approveSharesBody: intl.formatMessage({ defaultMessage: 'Approve shares for redemption' }),
    redeemShares: intl.formatMessage({ defaultMessage: 'Redeem shares' }),
    claimShares: intl.formatMessage({ defaultMessage: 'Claim shares' }),
    noValue: intl.formatMessage({ defaultMessage: '——' }),
    insufficientFunds: intl.formatMessage({ defaultMessage: 'Insufficient funds' }),
    insufficientShares: intl.formatMessage({ defaultMessage: 'Insufficient shares' }),
    approveDSU: intl.formatMessage({ defaultMessage: 'Approve DSU' }),
    approveDSUBody: intl.formatMessage({ defaultMessage: 'Approve DSU to withdraw' }),
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
        const inputValue = Big18Math.fromFloatString(value)
        const balance = Big18Math.fromDecimals(usdcBalance, 6)
        if (inputValue > balance) {
          return copy.insufficientFunds
        }
        return true
      }
    } else {
      return (value: string) => {
        const inputValue = Big18Math.fromFloatString(value)
        if (inputValue > vaultAssets) {
          return copy.insufficientShares
        }
        return true
      }
    }
  }, [usdcBalance, vaultAssets, vaultFormOption, copy.insufficientFunds, copy.insufficientShares])

  return { max: maxValidator }
}

const setArgs = { shouldValidate: true, shouldDirty: true }

export const useOnAmountChange = (setValue: UseFormSetValue<FormValues>) =>
  useCallback(
    (newAmount: string) => {
      if (!isNumbersOnly(newAmount)) return
      setValue(FormNames.amount, newAmount, setArgs)
    },
    [setValue],
  )
