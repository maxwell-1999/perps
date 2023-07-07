import { arbitrum, arbitrumGoerli, baseGoerli, mainnet } from '@wagmi/chains'

import { SupportedAsset } from './assets'

export enum PerennialVaultType {
  alpha = 'alpha',
  bravo = 'bravo',
}

export const SupportedVaults: {
  [chainId: number]: { [vault in PerennialVaultType]?: boolean }
} = {
  [mainnet.id]: { alpha: false, bravo: false },
  [arbitrumGoerli.id]: { alpha: true, bravo: true },
  [arbitrum.id]: { alpha: true, bravo: true },
  [baseGoerli.id]: { alpha: true, bravo: false },
}

export const VaultMetadata: {
  [chainId: number]: { [key in PerennialVaultType]?: { name: string; assets: SupportedAsset[] } }
} = {
  [arbitrumGoerli.id]: {
    [PerennialVaultType.alpha]: { name: 'Blue Chip', assets: [SupportedAsset.eth] },
    [PerennialVaultType.bravo]: { name: 'Arbitrum Ecosystem', assets: [SupportedAsset.link] },
  },
  [arbitrum.id]: {
    [PerennialVaultType.alpha]: { name: 'Blue Chip', assets: [SupportedAsset.eth] },
    [PerennialVaultType.bravo]: { name: 'Arbitrum Ecosystem', assets: [SupportedAsset.arb] },
  },
  [baseGoerli.id]: {
    [PerennialVaultType.alpha]: { name: 'Blue Chip', assets: [SupportedAsset.eth] },
  },
}
