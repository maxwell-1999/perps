import { VaultAccountSnapshot2 } from '@/hooks/vaults2'
import { Balances } from '@/hooks/wallet'
import { Big6Math } from '@/utils/big6Utils'

import { VaultFormOption } from '../constants'
import { RequiredApprovals } from './constants'

export const getRequiredApprovals = ({
  amount,
  balances,
  vaultOption,
  vaultAccountSnapshot,
}: {
  amount: bigint
  balances: Balances
  vaultOption: VaultFormOption
  vaultAccountSnapshot?: VaultAccountSnapshot2
}): RequiredApprovals[] => {
  if (!balances) {
    return []
  }
  const approvals = []
  if (!vaultAccountSnapshot?.multiInvokerApproved) {
    approvals.push(RequiredApprovals.operator)
  }

  if (vaultOption === VaultFormOption.Deposit) {
    if (amount > Big6Math.fromDecimals(balances.usdcAllowance, 6)) {
      approvals.push(RequiredApprovals.usdc)
    }
  }
  return approvals
}

export const setAmountForConfirmation = ({
  maxWithdrawal,
  amount,
  vaultUserSnapshot,
}: {
  maxWithdrawal: boolean
  amount: string
  vaultUserSnapshot: VaultAccountSnapshot2
}) => {
  const { assets } = vaultUserSnapshot
  if (assets && maxWithdrawal) {
    return assets
  }
  return Big6Math.fromFloatString(amount)
}
