import { VaultSymbol } from '@/constants/vaults'
import { Balances } from '@/hooks/wallet'
import { Big18Math } from '@/utils/big18Utils'

import { RequiredApprovals, VaultFormOption } from './constants'

export const getRequiredApprovals = ({
  amount,
  vaultSymbol,
  balances,
  vaultOption,
  claimable,
  totalSupply,
  totalAssets,
}: {
  amount: bigint
  vaultSymbol: VaultSymbol
  balances: Balances
  vaultOption: VaultFormOption
  claimable: bigint
  totalSupply: bigint
  totalAssets: bigint
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
    const approximateShares = Big18Math.div(Big18Math.mul(amount, totalSupply), totalAssets)
    const sharesAllowance = balances.sharesAllowance[vaultSymbol] ?? 0n
    if (approximateShares > sharesAllowance) {
      approvals.push(RequiredApprovals.shares)
    }
    if (claimable > balances.dsuAllowance) {
      approvals.push(RequiredApprovals.dsu)
    }
  }
  return approvals
}
