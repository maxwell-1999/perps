import { VaultSymbol } from '@/constants/vaults'
import { VaultSnapshot, VaultUserSnapshot } from '@/hooks/vaults'
import { Balances } from '@/hooks/wallet'
import { Big18Math } from '@/utils/big18Utils'

import { VaultFormOption } from '../constants'
import { RequiredApprovals } from './constants'

export const getRequiredApprovals = ({
  amount,
  vaultSymbol,
  balances,
  vaultOption,
  vaultSnapshot,
}: {
  amount: bigint
  vaultSymbol: VaultSymbol
  balances: Balances
  vaultOption: VaultFormOption
  vaultSnapshot: VaultSnapshot
}): RequiredApprovals[] => {
  if (!balances) {
    return []
  }
  const approvals = []
  if (vaultOption === VaultFormOption.Deposit) {
    if (amount > Big18Math.fromDecimals(balances.usdcAllowance, 6)) {
      approvals.push(RequiredApprovals.usdc)
    }
  }
  if (vaultOption === VaultFormOption.Redeem) {
    const approximateShares = Big18Math.div(Big18Math.mul(amount, vaultSnapshot.totalSupply), vaultSnapshot.totalAssets)
    const sharesAllowance = balances.sharesAllowance[vaultSymbol] ?? 0n
    const requiresSharesApproval = approximateShares > sharesAllowance

    if (requiresSharesApproval) {
      approvals.push(RequiredApprovals.shares)
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
  vaultUserSnapshot: VaultUserSnapshot
}) => {
  const { assets } = vaultUserSnapshot
  if (assets && maxWithdrawal) {
    return assets
  }
  return Big18Math.fromFloatString(amount)
}
