import { arbitrum, arbitrumGoerli, baseGoerli } from '@wagmi/chains'

import { ClaimEvent, DepositEvent, RedemptionEvent } from '@t/generated/BalancedVaultAbi'
import { IPerennialLens } from '@t/generated/LensAbi'

import { SupportedAsset } from './assets'

export type PerennialVaultType = 'alpha' | 'bravo'

export const SupportedVaults: {
  [chainId: number]: { [vault in PerennialVaultType]?: boolean }
} = {
  [arbitrumGoerli.id]: { alpha: true, bravo: true },
  [arbitrum.id]: { alpha: true, bravo: true },
  [baseGoerli.id]: { alpha: true },
}

export const VaultMetadata: {
  [chainId: number]: { [vault in PerennialVaultType]?: { name: string; assets: SupportedAsset[] } }
} = {
  [arbitrumGoerli.id]: {
    alpha: { name: 'Blue Chip', assets: [SupportedAsset.eth] },
    bravo: { name: 'Arbitrum Ecosystem', assets: [SupportedAsset.link] },
  },
  [arbitrum.id]: {
    alpha: { name: 'Blue Chip', assets: [SupportedAsset.eth] },
    bravo: { name: 'Arbitrum Ecosystem', assets: [SupportedAsset.arb] },
  },
  [baseGoerli.id]: {
    alpha: { name: 'Blue Chip', assets: [SupportedAsset.eth] },
  },
}

export type VaultSnapshot = {
  address: string
  name: string
  symbol: string
  long: string
  short: string
  totalSupply: bigint
  totalAssets: bigint
  targetLeverage: bigint
  maxCollateral: bigint
  longSnapshot: IPerennialLens.ProductSnapshotStruct
  shortSnapshot: IPerennialLens.ProductSnapshotStruct
  longUserSnapshot: IPerennialLens.UserProductSnapshotStruct
  shortUserSnapshot: IPerennialLens.UserProductSnapshotStruct
  canSync: boolean
}

export type VaultUserSnapshot = {
  balance: bigint
  assets: bigint
  claimable: bigint
  totalDeposit: bigint
  totalClaim: bigint
  currentPositionDeposits: bigint
  currentPositionClaims: bigint
  deposits: DepositEvent.Event[]
  redemptions: RedemptionEvent.Event[]
  pendingRedemptionAmount: bigint
  pendingDepositAmount: bigint
  claims: ClaimEvent.Event[]
}
