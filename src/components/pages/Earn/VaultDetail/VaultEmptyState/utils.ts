import { VaultSnapshot } from '@/hooks/vaults'
import { Big18Math } from '@/utils/big18Utils'

import { SharesAllowance } from './constants'

export const getRequiresShareApproval = ({
  assets,
  sharesAllowance,
  vaultSnapshot,
}: {
  assets: bigint
  sharesAllowance: SharesAllowance
  vaultSnapshot: VaultSnapshot
}): boolean => {
  if (!sharesAllowance) {
    return false
  }
  const approximateShares = Big18Math.div(Big18Math.mul(assets, vaultSnapshot.totalSupply), vaultSnapshot.totalAssets)
  const allowance = sharesAllowance[vaultSnapshot.vaultType] ?? 0n
  const requiresSharesApproval = approximateShares > allowance

  return requiresSharesApproval
}
