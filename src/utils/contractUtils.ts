import { Provider } from 'ethers'

import { BalancedVaultAlphaAddresses, BalancedVaultBravoAddresses } from '@/constants/contracts'
import { SupportedChainId } from '@/constants/network'
import { PerennialVaultType } from '@/constants/vaults'

import { BalancedVaultAbi__factory, IProductAbi__factory } from '@t/generated'

export function getVaultForType(vaultType: PerennialVaultType, chainId: SupportedChainId, provider: Provider) {
  switch (vaultType) {
    case 'alpha':
      return BalancedVaultAbi__factory.connect(BalancedVaultAlphaAddresses[chainId] as string, provider)
    case 'bravo':
      return BalancedVaultAbi__factory.connect(BalancedVaultBravoAddresses[chainId] as string, provider)
  }
}

export function getProductContract(productAddress: string, provider: Provider) {
  return IProductAbi__factory.connect(productAddress, provider)
}
