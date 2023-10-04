import { Address, getAddress } from 'viem'
import { arbitrum, arbitrumGoerli, baseGoerli } from 'viem/chains'

import { notEmpty } from '@/utils/arrayUtils'

import { SupportedAsset } from './markets'
import { SupportedChainId } from './network'

export enum PerennialVaultType {
  alpha = 'alpha',
  bravo = 'bravo',
}

export const SupportedVaults: {
  [chainId in SupportedChainId]: { [vault in PerennialVaultType]?: boolean }
} = {
  [arbitrumGoerli.id]: { alpha: true, bravo: false },
  [arbitrum.id]: { alpha: true, bravo: true },
  [baseGoerli.id]: { alpha: true, bravo: false },
}

export const VaultMetadataV1: {
  [chainId in SupportedChainId]?: { [key in PerennialVaultType]?: { name: string; assets: SupportedAsset[] } }
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

export const VaultMetadata: {
  [chainId in SupportedChainId]?: { [key in PerennialVaultType]?: { name: string } }
} = {
  [arbitrumGoerli.id]: {
    [PerennialVaultType.alpha]: { name: 'Blue Chip' },
    [PerennialVaultType.bravo]: { name: 'Large Cap' },
  },
  [arbitrum.id]: {
    [PerennialVaultType.alpha]: { name: 'Blue Chip' },
    [PerennialVaultType.bravo]: { name: 'Large Cap' },
  },
  [baseGoerli.id]: {
    [PerennialVaultType.alpha]: { name: 'Alpha Vault' },
  },
}

export const ChainVaults2: {
  [chainId in SupportedChainId]: {
    [vault in PerennialVaultType]?: Address
  }
} = {
  [arbitrumGoerli.id]: {
    alpha: getAddress('0xA86947dB4C5b13adb90aCaCb6630553f8EBcea76'),
    bravo: getAddress('0xF4cf92427E2CFa4410D1009f7B2c3eE3E9367f0d'),
  },
  [arbitrum.id]: {
    alpha: getAddress('0xF8b6010FD6ba8F3E52c943A1473B1b1459a73094'),
    bravo: getAddress('0x699e37DfCEe5c6E4c5D0bC1C2FFbC2afEC55f6FB'),
  },
  [baseGoerli.id]: {},
}

export const ChainVaults: {
  [chainId in SupportedChainId]: {
    [vault in PerennialVaultType]?: Address
  }
} = {
  [arbitrumGoerli.id]: {
    alpha: getAddress('0x1C521Cd674222699520613D599F5e54F272b9972'),
    bravo: getAddress('0xad3565680aEcEe27A39249D8c2D55dAc79BE5Ad0'),
  },
  [arbitrum.id]: {
    alpha: getAddress('0x5A572B5fBBC43387B5eF8de2C4728A4108ef24a6'),
    bravo: getAddress('0x1960628db367281B1a186dD5B80B5dd6978F016F'),
  },
  [baseGoerli.id]: { alpha: getAddress('0x26F70E5fA46aD10DF9d43ba469cfAbC79B073a01') },
}

export const chainVaultsWithAddress = (chainId: SupportedChainId) => {
  return Object.entries(ChainVaults2[chainId])
    .map(([vault, vaultAddress]) => (!!vaultAddress ? { vault, vaultAddress } : null))
    .filter(notEmpty)
}
