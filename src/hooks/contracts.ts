import { WalletClient } from 'viem'
import { getContract } from 'wagmi/actions'

import {
  CollateralAddresses,
  DSUAddresses,
  LensAddresses,
  MultiInvokerAddresses,
  USDCAddresses,
} from '@/constants/contracts'
import { useChainId } from '@/hooks/network'

import { ERC20Abi } from '@abi/ERC20.abi'
import { ICollateralAbi } from '@abi/ICollateral.abi'
import { LensAbi, LensProductSnapshotAbi, LensProtocolSnapshotAbi, LensUserProductSnapshotAbi } from '@abi/Lens.abi'
import { MultiInvokerAbi } from '@abi/MultiInvoker.abi'

export const useLens = () => {
  const chainId = useChainId()

  return getContract({ address: LensAddresses[chainId], abi: LensAbi, chainId })
}

// We need these because Viem currently doesn't handle overloads correctly
// TODO(arjun): Remove this when Viem supports overloads
export const useLensProductSnapshot = () => {
  const chainId = useChainId()

  return getContract({ address: LensAddresses[chainId], abi: LensProductSnapshotAbi, chainId })
}

export const useLensUserProductSnapshot = () => {
  const chainId = useChainId()

  return getContract({ address: LensAddresses[chainId], abi: LensUserProductSnapshotAbi, chainId })
}

export const useLensProtocolSnapshot = () => {
  const chainId = useChainId()

  return getContract({ address: LensAddresses[chainId], abi: LensProtocolSnapshotAbi, chainId })
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
  const chainId = useChainId()

  return getContract({ address: CollateralAddresses[chainId], abi: ICollateralAbi, chainId })
}

export const useDSU = (signer?: WalletClient) => {
  const chainId = useChainId()

  return getContract({
    address: DSUAddresses[chainId],
    abi: ERC20Abi,
    chainId,
    walletClient: signer,
  })
}

export const useUSDC = (signer?: WalletClient) => {
  const chainId = useChainId()

  return getContract({
    address: USDCAddresses[chainId],
    abi: ERC20Abi,
    chainId,
    walletClient: signer,
  })
}

export const useMultiInvoker = (signer?: WalletClient) => {
  const chainId = useChainId()

  return getContract({
    address: MultiInvokerAddresses[chainId],
    abi: MultiInvokerAbi,
    chainId,
    walletClient: signer,
  })
}
