import { Address, WalletClient } from 'wagmi'
import { getContract } from 'wagmi/actions'

import { BalancedVaultAlphaAddresses, BalancedVaultBravoAddresses } from '@/constants/contracts'
import { SupportedChainId } from '@/constants/network'
import { PerennialVaultType } from '@/constants/vaults'

import { BalancedVaultAbi } from '@abi/BalancedVault.abi'
import { IProductAbi } from '@abi/IProduct.abi'

export function getVaultAddressForType(vaultType: PerennialVaultType, chainId: SupportedChainId) {
  switch (vaultType) {
    case 'alpha':
      return BalancedVaultAlphaAddresses[chainId]
    case 'bravo':
      return BalancedVaultBravoAddresses[chainId]
  }
}

export function getVaultForType(vaultType: PerennialVaultType, chainId: SupportedChainId, signer?: WalletClient) {
  const address = getVaultAddressForType(vaultType, chainId)
  if (!address) return
  return getContract({ abi: BalancedVaultAbi, address, walletClient: signer })
}

export function getProductContract(productAddress: Address, chainId: SupportedChainId) {
  return getContract({ abi: IProductAbi, address: productAddress, chainId })
}
