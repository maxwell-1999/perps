import { Address, getAddress } from 'viem'
import { arbitrum, arbitrumGoerli, baseGoerli, goerli, mainnet } from 'wagmi/chains'

import { SupportedAsset } from '@/constants/assets'
import { SupportedChainId } from '@/constants/network'

export const ChainMarkets: {
  [chainId in SupportedChainId]: {
    [asset in SupportedAsset]?: { long?: Address; short?: Address }
  }
} = {
  [arbitrumGoerli.id]: {
    btc: {
      long: getAddress('0x6d13f98eb8c6625846fc3d6cdaab455eedc64b45'),
      short: getAddress('0xE442047148ACc3Df089500FC380bAAE8fF375AA4'),
    },
    eth: {
      long: getAddress('0x798B31664ec791258E78FE66CFFDE5855A6f3dCf'),
      short: getAddress('0x3354d131ec11511023d29b75cc6717b099220cff'),
    },
    link: {
      long: getAddress('0x995d27c9a558dc3f9575df58933ab07effd2cf11'),
      short: getAddress('0x6cf77dada031c5eb8fb31fc9bccf9319c1e218ef'),
    },
  },
  [arbitrum.id]: {
    eth: {
      long: getAddress('0x260422c091da8c88ef21f5d1112ab43aa94787cd'),
      short: getAddress('0x5b99d122af97ba012aa237bd01577278bfaaff1e'),
    },
    arb: {
      long: getAddress('0x5E660B7B8357059241EAEc143e1e68A5A108D035'),
      short: getAddress('0x4e67a8a428206Af5a6AC00Ba08a67Ce827182985'),
    },
  },
  [baseGoerli.id]: {
    eth: {
      long: getAddress('0xace78035e5C3348BbB31c6dbF90B0Ef4CbEE9bAE'),
      short: getAddress('0x3C1FC9E9a9b5b014B53c571f422E32D02ff5BF13'),
    },
  },
  [mainnet.id]: {
    eth: {
      long: getAddress('0xdB60626FF6cDC9dB07d3625A93d21dDf0f8A688C'),
      short: getAddress('0xfeD3E166330341e0305594B8c6e6598F9f4Cbe9B'),
    },
    msqth: {
      long: getAddress('0x60b24e58A46896724f8E2B18F18c801976d2b569'),
    },
  },
  [goerli.id]: {
    eth: {
      short: getAddress('0xe45602c350d99dcf00ef8f53430c6affd6b029aa'),
    },
    msqth: {
      long: getAddress('0x3a5358300bffcf2f13af8c6d2ede0e5580ded9d8'),
    },
  },
}
