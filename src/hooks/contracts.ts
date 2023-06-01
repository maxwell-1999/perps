import { Signer } from 'ethers'
import { Address, getAddress } from 'viem'
import { arbitrum, arbitrumGoerli, baseGoerli, goerli, mainnet } from 'wagmi/chains'

import { DSU, USDC, controllerContract, multiInvokerContract } from '@/constants/contracts'
import { SupportedChainId } from '@/constants/network'
import { useChainId, useProvider } from '@/hooks/network'

import {
  Controller_ImplAbi__factory,
  Erc20Abi__factory,
  ICollateralAbi__factory,
  LensAbi__factory,
  MultiInvokerAbi__factory,
} from '@t/generated'

type AddressMapping = { [chain in SupportedChainId]: Address }

export const useLens = () => {
  const addresses: AddressMapping = {
    [mainnet.id]: '0x26F70E5fA46aD10DF9d43ba469cfAbC79B073a01',
    [arbitrum.id]: '0x1593318424df66128cb7d0c5574B1283C3A74C3d',
    [arbitrumGoerli.id]: '0x19890Cf5C9A0B8d2F71eB71347d126b6F7d78B76',
    [goerli.id]: '0xda17b128BFd23112E946FB4e7BA162029D7d1CdE',
    [baseGoerli.id]: '0x2b99224DAD73d7D84b7C74E9161BbD0D01a2A15b',
  }

  const provider = useProvider()
  const chainId = useChainId()

  return LensAbi__factory.connect(addresses[chainId], provider)
}

export const useCollateral = () => {
  const addresses: AddressMapping = {
    [mainnet.id]: getAddress('0x2d264EBDb6632A06A1726193D4d37FeF1E5dbDcd'),
    [arbitrum.id]: getAddress('0xAF8CeD28FcE00ABD30463D55dA81156AA5aEEEc2'),
    [arbitrumGoerli.id]: getAddress('0xf3E6057474199179D9eFb733f2cf47F41Cc8a1ED'),
    [goerli.id]: getAddress('0x741FC06B5DE25AC5b31F54B92eE3Bf1C97bf8666'),
    [baseGoerli.id]: getAddress('0xA59eF0208418559770a48D7ae4f260A28763167B'),
  }

  const provider = useProvider()
  const chainId = useChainId()

  return ICollateralAbi__factory.connect(addresses[chainId], provider)
}

export const useDSU = () => {
  const provider = useProvider()
  const chainId = useChainId()

  return Erc20Abi__factory.connect(DSU.address[chainId], provider)
}

export const useUSDC = () => {
  const provider = useProvider()
  const chainId = useChainId()

  return Erc20Abi__factory.connect(USDC.address[chainId], provider)
}

export const useMultiInvoker = (signer: Signer) => {
  const provider = useProvider()
  const chainId = useChainId()

  return MultiInvokerAbi__factory.connect(multiInvokerContract.address[chainId], signer ? signer : provider)
}

export const useController = () => {
  const provider = useProvider()
  const chainId = useChainId()

  return Controller_ImplAbi__factory.connect(controllerContract.address[chainId], provider)
}
