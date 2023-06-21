import { providers } from '@premia/ethers-multicall'
import { BaseContract } from 'ethers'

import {
  CollateralAddresses,
  DSUAddresses,
  LensAddresses,
  MultiInvokerAddresses,
  USDCAddresses,
} from '@/constants/contracts'
import { useChainId, useMulticallProvider, useProvider } from '@/hooks/network'

import { ERC20Abi__factory, ICollateralAbi__factory, LensAbi__factory, MultiInvokerAbi__factory } from '@t/generated'

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

export function useMulticallContract<T extends BaseContract>(contract: T): T {
  const provider = useMulticallProvider()
  const multicallProvider = new providers.MulticallProvider(provider)
  return contract.connect(multicallProvider) as T
}
