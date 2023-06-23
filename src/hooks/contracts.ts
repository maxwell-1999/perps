import { getContract } from 'wagmi/actions'

import {
  CollateralAddresses,
  DSUAddresses,
  LensAddresses,
  MultiInvokerAddresses,
  USDCAddresses,
} from '@/constants/contracts'
import { useChainId, useProvider } from '@/hooks/network'

import { LensProductSnapshotAbi, LensUserProductSnapshotAbi } from '@abi/Lens.abi'

import { ERC20Abi__factory, ICollateralAbi__factory, LensAbi__factory, MultiInvokerAbi__factory } from '@t/generated'

export const useLens = () => {
  const provider = useProvider()
  const chainId = useChainId()

  return LensAbi__factory.connect(LensAddresses[chainId], provider)
}

export const useLensProductSnapshotViem = () => {
  const chainId = useChainId()

  return getContract({ address: LensAddresses[chainId], abi: LensProductSnapshotAbi, chainId })
}

export const useLensUserProductSnapshotViem = () => {
  const chainId = useChainId()

  return getContract({ address: LensAddresses[chainId], abi: LensUserProductSnapshotAbi, chainId })
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
