import { VaultSnapshot, VaultSymbol, VaultUserSnapshot } from '@/constants/vaults'
import { Balances } from '@/hooks/wallet'
import { Big18Math } from '@/utils/big18Utils'

import { RequiredApprovals, VaultFormOption } from './constants'

export const getRequiredApprovals = ({
  amount,
  vaultSymbol,
  balances,
  vaultOption,
  isClaimOnly,
  vaultSnapshot,
  vaultUserSnapshot,
}: {
  amount: bigint
  vaultSymbol: VaultSymbol
  balances: Balances
  vaultOption: VaultFormOption
  isClaimOnly: boolean
  vaultSnapshot: VaultSnapshot
  vaultUserSnapshot: VaultUserSnapshot
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
  if (vaultOption === VaultFormOption.Withdraw) {
    const requiresDSUApproval = vaultUserSnapshot.claimable > balances.dsuAllowance || amount > balances.dsuAllowance
    const approximateShares = Big18Math.div(Big18Math.mul(amount, vaultSnapshot.totalSupply), vaultSnapshot.totalAssets)
    const sharesAllowance = balances.sharesAllowance[vaultSymbol] ?? 0n
    const requiresSharesApproval = approximateShares > sharesAllowance

    if (isClaimOnly) {
      return requiresDSUApproval ? [RequiredApprovals.dsu] : []
    }
    if (requiresSharesApproval) {
      approvals.push(RequiredApprovals.shares)
    }
    if (requiresDSUApproval) {
      approvals.push(RequiredApprovals.dsu)
    }
  }
  return approvals
}

export const setAmountForConfirmation = ({
  maxWithdrawal,
  amount,
  vaultUserSnapshot,
  isClaimOnly,
}: {
  maxWithdrawal: boolean
  amount: string
  vaultUserSnapshot: VaultUserSnapshot
  isClaimOnly: boolean
}) => {
  const { assets, claimable } = vaultUserSnapshot
  if (isClaimOnly) {
    return claimable
  }
  if (assets && maxWithdrawal) {
    return assets
  }
  return Big18Math.fromFloatString(amount)
}
