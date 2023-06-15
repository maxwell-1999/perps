import { getAddress } from 'viem'
import { Address } from 'wagmi'
import { arbitrum, arbitrumGoerli, baseGoerli, goerli, mainnet } from 'wagmi/chains'

import { SupportedChainId } from './network'

type AddressMapping = { [chain in SupportedChainId]: Address }

export const LensAddresses: AddressMapping = {
  [mainnet.id]: getAddress('0x26F70E5fA46aD10DF9d43ba469cfAbC79B073a01'),
  [arbitrum.id]: getAddress('0x1593318424df66128cb7d0c5574B1283C3A74C3d'),
  [arbitrumGoerli.id]: getAddress('0x19890Cf5C9A0B8d2F71eB71347d126b6F7d78B76'),
  [goerli.id]: getAddress('0xda17b128BFd23112E946FB4e7BA162029D7d1CdE'),
  [baseGoerli.id]: getAddress('0x2b99224DAD73d7D84b7C74E9161BbD0D01a2A15b'),
}

export const CollateralAddresses: AddressMapping = {
  [mainnet.id]: getAddress('0x2d264EBDb6632A06A1726193D4d37FeF1E5dbDcd'),
  [arbitrum.id]: getAddress('0xAF8CeD28FcE00ABD30463D55dA81156AA5aEEEc2'),
  [arbitrumGoerli.id]: getAddress('0xf3E6057474199179D9eFb733f2cf47F41Cc8a1ED'),
  [goerli.id]: getAddress('0x741FC06B5DE25AC5b31F54B92eE3Bf1C97bf8666'),
  [baseGoerli.id]: getAddress('0xA59eF0208418559770a48D7ae4f260A28763167B'),
}

export const MultiInvokerAddresses: AddressMapping = {
  [goerli.id]: getAddress('0xb741E8211463A346a67814672E10a2f7D6587101'),
  [mainnet.id]: getAddress('0xE77076D3EeE12dA1d7402Ff4e6Ca12A8d99FcE8B'),
  [arbitrum.id]: getAddress('0xe72E82b672d7D3e206327C0762E9805fbFCBCa92'),
  [arbitrumGoerli.id]: getAddress('0x86ccFAdd81433929e04e32C056A2eEFc08359B60'),
  [baseGoerli.id]: getAddress('0x19890Cf5C9A0B8d2F71eB71347d126b6F7d78B76'),
}

export const DSUAddresses: AddressMapping = {
  [goerli.id]: getAddress('0x237D7a40d3A28aA5dAAb786570d3d8bf8496e497'),
  [mainnet.id]: getAddress('0x605D26FBd5be761089281d5cec2Ce86eeA667109'),
  [arbitrum.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
  [arbitrumGoerli.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
  [baseGoerli.id]: getAddress('0x58e0c542ab540e0dd3b4fd96cc46b0aad1196bfe'),
}

export const USDCAddresses: AddressMapping = {
  [goerli.id]: getAddress('0x07865c6E87B9F70255377e024ace6630C1Eaa37F'),
  [mainnet.id]: getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
  [arbitrum.id]: getAddress('0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'),
  [arbitrumGoerli.id]: getAddress('0x6775842AE82BF2F0f987b10526768Ad89d79536E'),
  [baseGoerli.id]: getAddress('0x7b4adf64b0d60ff97d672e473420203d52562a84'),
}

// Chainalysis contract address only exists on Eth Mainnet
export const ChainalysisContractAddress = '0x40c57923924b5c5c5455c48d93317139addac8fb'

export const BalancedVaultAlphaAddresses: Partial<AddressMapping> = {
  [arbitrum.id]: getAddress('0x5A572B5fBBC43387B5eF8de2C4728A4108ef24a6'),
  [arbitrumGoerli.id]: getAddress('0x1C521Cd674222699520613D599F5e54F272b9972'),
  [baseGoerli.id]: getAddress('0x26F70E5fA46aD10DF9d43ba469cfAbC79B073a01'),
}

export const BalancedVaultBravoAddresses: Partial<AddressMapping> = {
  [arbitrum.id]: getAddress('0x1960628db367281B1a186dD5B80B5dd6978F016F'),
  [arbitrumGoerli.id]: getAddress('0xad3565680aEcEe27A39249D8c2D55dAc79BE5Ad0'),
}
