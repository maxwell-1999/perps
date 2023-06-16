import { arbitrum, arbitrumGoerli, baseGoerli } from '@wagmi/chains'
import { parseEther } from 'viem'

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

export enum VaultSymbol {
  PVA = 'PVA',
  PVB = 'PVB',
}

export const VaultMetadata: {
  [chainId: number]: { [key in VaultSymbol]?: { name: string; assets: SupportedAsset[] } }
} = {
  [arbitrumGoerli.id]: {
    [VaultSymbol.PVA]: { name: 'Blue Chip', assets: [SupportedAsset.eth] },
    [VaultSymbol.PVB]: { name: 'Arbitrum Ecosystem', assets: [SupportedAsset.link] },
  },
  [arbitrum.id]: {
    [VaultSymbol.PVA]: { name: 'Blue Chip', assets: [SupportedAsset.eth] },
    [VaultSymbol.PVB]: { name: 'Arbitrum Ecosystem', assets: [SupportedAsset.arb] },
  },
  [baseGoerli.id]: {
    [VaultSymbol.PVA]: { name: 'Blue Chip', assets: [SupportedAsset.eth] },
  },
}

export const FeeApr: { [chainId: number]: { [key in VaultSymbol]?: bigint } } = {
  [arbitrum.id]: {
    [VaultSymbol.PVA]: parseEther('0.1391'),
    [VaultSymbol.PVB]: parseEther('0.1206'),
  },
  [arbitrumGoerli.id]: {
    [VaultSymbol.PVA]: parseEther('0.1391'),
    [VaultSymbol.PVB]: parseEther('0.1206'),
  },
  [baseGoerli.id]: {
    [VaultSymbol.PVA]: parseEther('0.1391'),
  },
}

export type VaultSnapshot = {
  address: string
  name: string
  symbol: VaultSymbol
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
