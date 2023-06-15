import { Provider } from 'ethers'

import {
  BalancedVaultAlphaAddresses,
  BalancedVaultBravoAddresses,
  CollateralAddresses,
  DSUAddresses,
  LensAddresses,
  MultiInvokerAddresses,
  USDCAddresses,
} from '@/constants/contracts'
import { SupportedChainId } from '@/constants/network'
import { PerennialVaultType } from '@/constants/vaults'
import { useChainId, useProvider } from '@/hooks/network'

import {
  BalancedVaultAbi__factory,
  ERC20Abi__factory,
  ICollateralAbi__factory,
  IProductAbi__factory,
  LensAbi__factory,
  MultiInvokerAbi__factory,
} from '@t/generated'

export const useLens = () => {
  const provider = useProvider()
  const chainId = useChainId()

  return LensAbi__factory.connect(LensAddresses[chainId], provider)
}

export const useCollateral = () => {
  const provider = useProvider()
  const chainId = useChainId()

  return ICollateralAbi__factory.connect(CollateralAddresses[chainId], provider)
}

export const useDSU = () => {
  const provider = useProvider()
  const chainId = useChainId()

  return ERC20Abi__factory.connect(DSUAddresses[chainId], provider)
}

export const useUSDC = () => {
  const provider = useProvider()
  const chainId = useChainId()

  return ERC20Abi__factory.connect(USDCAddresses[chainId], provider)
}

export const useMultiInvoker = () => {
  const provider = useProvider()
  const chainId = useChainId()

  return MultiInvokerAbi__factory.connect(MultiInvokerAddresses[chainId], provider)
}

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
