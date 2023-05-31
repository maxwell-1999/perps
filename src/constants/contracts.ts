import { arbitrum, arbitrumGoerli, baseGoerli, goerli, mainnet } from 'wagmi/chains'

import ControllerAbi from '../../abi/Controller_Impl.abi.json'
import Erc20ABI from '../../abi/erc20.abi.json'
import MultiInvokerAbi from '../../abi/multiInvoker.abi.json'

export const multiInvokerContract = {
  address: {
    [goerli.id]: '0xb741E8211463A346a67814672E10a2f7D6587101',
    [mainnet.id]: '0xE77076D3EeE12dA1d7402Ff4e6Ca12A8d99FcE8B',
    [arbitrum.id]: '0xe72E82b672d7D3e206327C0762E9805fbFCBCa92',
    [arbitrumGoerli.id]: '0x86ccFAdd81433929e04e32C056A2eEFc08359B60',
    [baseGoerli.id]: '0x19890Cf5C9A0B8d2F71eB71347d126b6F7d78B76',
  },
  abi: MultiInvokerAbi.abi,
}

export const DSU = {
  address: {
    [goerli.id]: '0x237D7a40d3A28aA5dAAb786570d3d8bf8496e497',
    [mainnet.id]: '0x605D26FBd5be761089281d5cec2Ce86eeA667109',
    [arbitrum.id]: '0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b',
    [arbitrumGoerli.id]: '0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b',
    [baseGoerli.id]: '0x58e0c542ab540e0dd3b4fd96cc46b0aad1196bfe',
  },
  abi: Erc20ABI,
}

export const USDC = {
  address: {
    [goerli.id]: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    [mainnet.id]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    [arbitrum.id]: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    [arbitrumGoerli.id]: '0x6775842AE82BF2F0f987b10526768Ad89d79536E',
    [baseGoerli.id]: '0x7b4adf64b0d60ff97d672e473420203d52562a84',
  },
  abi: Erc20ABI,
}

export const controllerContract = {
  address: {
    // controller proxy address
    [goerli.id]: '0x7c4ABBF7CB0C0BcB72917734B068Ed4D1AcdF8C5',
    [mainnet.id]: '0x9df509186b6d3b7D033359f94c8b1BB5544d51b3',
    [arbitrum.id]: '0xA59eF0208418559770a48D7ae4f260A28763167B',
    [arbitrumGoerli.id]: '0x6cF1A4373ba7D10bC37fAeC4694807B626B7f161',
    [baseGoerli.id]: '0x49bCb3e1b0bA6A68EE1f1941EB56Ac7F46B67e09',
  },
  abi: ControllerAbi.abi,
}
