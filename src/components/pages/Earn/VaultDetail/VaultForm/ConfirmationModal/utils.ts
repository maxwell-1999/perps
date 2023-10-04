import { VaultAccountSnapshot2 } from '@/hooks/vaults2'
import { Balances } from '@/hooks/wallet'
import { Big6Math } from '@/utils/big6Utils'

import { VaultFormOption } from '../constants'
import { RequiredApprovals } from './constants'

export const getRequiredApprovals = ({
  amount,
  balances,
  vaultOption,
  vaultFactoryApproved,
}: {
  amount: bigint
  balances: Balances
  vaultOption: VaultFormOption
  vaultFactoryApproved: boolean
}): RequiredApprovals[] => {
  if (!balances) {
    return []
  }
  const approvals = []
  if (!vaultFactoryApproved) {
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
