import { getAddress, zeroAddress } from 'viem'
import { Address } from 'wagmi'
import { arbitrum, arbitrumGoerli, baseGoerli } from 'wagmi/chains'

import { SupportedChainId } from './network'

type AddressMapping = { [chain in SupportedChainId]: Address }

export const ControllerAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xA59eF0208418559770a48D7ae4f260A28763167B'),
  [arbitrumGoerli.id]: getAddress('0x6cF1A4373ba7D10bC37fAeC4694807B626B7f161'),
}

export const LensAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0x1593318424df66128cb7d0c5574B1283C3A74C3d'),
  [arbitrumGoerli.id]: getAddress('0x19890Cf5C9A0B8d2F71eB71347d126b6F7d78B76'),
}

export const CollateralAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xAF8CeD28FcE00ABD30463D55dA81156AA5aEEEc2'),
  [arbitrumGoerli.id]: getAddress('0xf3E6057474199179D9eFb733f2cf47F41Cc8a1ED'),
}

export const MultiInvokerAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xe72E82b672d7D3e206327C0762E9805fbFCBCa92'),
  [arbitrumGoerli.id]: getAddress('0x86ccFAdd81433929e04e32C056A2eEFc08359B60'),
}

export const MultiInvoker2Addresses: AddressMapping = {
  [arbitrum.id]: getAddress('0x431603567EcBb4aa1Ce5a4fdBe5554cAEa658832'),
  [arbitrumGoerli.id]: getAddress('0x9F6f72Cf419121090C761D0488f61D2534Da4196'),
}

export const MarketFactoryAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xDaD8A103473dfd47F90168A0E46766ed48e26EC7'),
  [arbitrumGoerli.id]: getAddress('0x8D8903B294B358BA1B5d91FB838e5dC35370c7D2'),
}

export const VaultFactoryAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xad3565680aEcEe27A39249D8c2D55dAc79BE5Ad0'),
  [arbitrumGoerli.id]: getAddress('0x97B34BA2FD1ff8Ce18b3bC7b05D1fcb87E95D6fc'),
}

export const OracleFactoryAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0x691FA1d4dc25f39a22Dc45Ca98080CF21Ca7eC64'),
  [arbitrumGoerli.id]: getAddress('0x60Ffc7F13223FBc5fD53C6EB5d65AE00b9201713'),
}

export const DSUAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
  [arbitrumGoerli.id]: getAddress('0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b'),
}

export const USDCAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'),
  [arbitrumGoerli.id]: getAddress('0x6775842AE82BF2F0f987b10526768Ad89d79536E'),
}
export const SeasonalMerkleTreeAddresses: AddressMapping = {
  [arbitrum.id]: getAddress('0x4Fc1cC62E5d0b12f5a9e3213B4177d2edb301F30'),
  [arbitrumGoerli.id]: getAddress('0xFc396EB5f44AEd885f12aa1ec09Ac7F110aCcB9D'),
}

// Chainalysis contract address only exists on Eth Mainnet
export const ChainalysisContractAddress = '0x40c57923924b5c5c5455c48d93317139addac8fb'
