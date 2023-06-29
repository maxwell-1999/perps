import { arbitrum, arbitrumGoerli, baseGoerli, mainnet } from '@wagmi/chains'

import { Big18Math } from '@/utils/big18Utils'

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
    [VaultSymbol.ePBV]: Big18Math.fromFloatString('0.1391'),
    [VaultSymbol.PVB]: Big18Math.fromFloatString('0.1206'),
  },
  [arbitrum.id]: {
    [VaultSymbol.PVA]: Big18Math.fromFloatString('0.1391'),
    [VaultSymbol.PVB]: Big18Math.fromFloatString('0.1206'),
  },
  [baseGoerli.id]: {
    [VaultSymbol.PVA]: Big18Math.fromFloatString('0.1391'),
  },
}
