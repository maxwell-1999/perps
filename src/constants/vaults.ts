import { arbitrum, arbitrumGoerli, baseGoerli, mainnet } from '@wagmi/chains'
import { parseEther } from 'viem'

import { ClaimEvent, DepositEvent, RedemptionEvent } from '@t/generated/BalancedVaultAbi'
import { IPerennialLens } from '@t/generated/LensAbi'
import { TypedContractEvent, TypedEventLog } from '@t/generated/common'

import { SupportedAsset } from './assets'

export enum PerennialVaultType {
  alpha = 'alpha',
  bravo = 'bravo',
}

export enum VaultSymbol {
  PVA = 'PVA',
  PVB = 'PVB',
  ePBV = 'ePBV',
}

export const SupportedVaults: {
  [chainId: number]: { [vault in PerennialVaultType]?: VaultSymbol | null }
} = {
  [mainnet.id]: { alpha: null, bravo: null },
  [arbitrumGoerli.id]: { alpha: VaultSymbol.ePBV, bravo: VaultSymbol.PVB },
  [arbitrum.id]: { alpha: VaultSymbol.PVA, bravo: VaultSymbol.PVB },
  [baseGoerli.id]: { alpha: VaultSymbol.PVA, bravo: null },
}

export const VaultMetadata: {
  [chainId: number]: { [key in VaultSymbol]?: { name: string; assets: SupportedAsset[] } }
} = {
  [arbitrumGoerli.id]: {
    [VaultSymbol.ePBV]: { name: 'Blue Chip', assets: [SupportedAsset.eth] },
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
  [arbitrumGoerli.id]: {
    [VaultSymbol.ePBV]: parseEther('0.1391'),
    [VaultSymbol.PVB]: parseEther('0.1206'),
  },
  [arbitrum.id]: {
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
  longSnapshot: IPerennialLens.ProductSnapshotStructOutput
  shortSnapshot: IPerennialLens.ProductSnapshotStructOutput
  longUserSnapshot: IPerennialLens.UserProductSnapshotStructOutput
  shortUserSnapshot: IPerennialLens.UserProductSnapshotStructOutput
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
  deposits: TypedEventLog<
    TypedContractEvent<DepositEvent.InputTuple, DepositEvent.OutputTuple, DepositEvent.OutputObject>
  >[]
  redemptions: TypedEventLog<
    TypedContractEvent<RedemptionEvent.InputTuple, RedemptionEvent.OutputTuple, RedemptionEvent.OutputObject>
  >[]
  pendingRedemptionAmount: bigint
  pendingDepositAmount: bigint
  claims: TypedEventLog<TypedContractEvent<ClaimEvent.InputTuple, ClaimEvent.OutputTuple, ClaimEvent.OutputObject>>[]
}
