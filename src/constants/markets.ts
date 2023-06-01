import { Address, getAddress } from 'viem'
import { arbitrum, arbitrumGoerli, baseGoerli, goerli, mainnet } from 'wagmi/chains'

import { SupportedAsset } from '@/constants/assets'
import { SupportedChainId } from '@/constants/network'

export enum OrderDirection {
  Long = 'Long',
  Short = 'Short',
}

export enum OpenPositionType {
  maker = 'maker',
  taker = 'taker',
}

export const ChainMarkets: {
  [chainId in SupportedChainId]: {
    [asset in SupportedAsset]?: { [OrderDirection.Long]?: Address; [OrderDirection.Short]?: Address }
  }
} = {
  [arbitrumGoerli.id]: {
    btc: {
      [OrderDirection.Long]: getAddress('0x6d13f98eb8c6625846fc3d6cdaab455eedc64b45'),
      [OrderDirection.Short]: getAddress('0xE442047148ACc3Df089500FC380bAAE8fF375AA4'),
    },
    eth: {
      [OrderDirection.Long]: getAddress('0x798B31664ec791258E78FE66CFFDE5855A6f3dCf'),
      [OrderDirection.Short]: getAddress('0x3354d131ec11511023d29b75cc6717b099220cff'),
    },
    link: {
      [OrderDirection.Long]: getAddress('0x995d27c9a558dc3f9575df58933ab07effd2cf11'),
      [OrderDirection.Short]: getAddress('0x6cf77dada031c5eb8fb31fc9bccf9319c1e218ef'),
    },
  },
  [arbitrum.id]: {
    eth: {
      [OrderDirection.Long]: getAddress('0x260422c091da8c88ef21f5d1112ab43aa94787cd'),
      [OrderDirection.Short]: getAddress('0x5b99d122af97ba012aa237bd01577278bfaaff1e'),
    },
    arb: {
      [OrderDirection.Long]: getAddress('0x5E660B7B8357059241EAEc143e1e68A5A108D035'),
      [OrderDirection.Short]: getAddress('0x4e67a8a428206Af5a6AC00Ba08a67Ce827182985'),
    },
  },
  [baseGoerli.id]: {
    eth: {
      [OrderDirection.Long]: getAddress('0xace78035e5C3348BbB31c6dbF90B0Ef4CbEE9bAE'),
      [OrderDirection.Short]: getAddress('0x3C1FC9E9a9b5b014B53c571f422E32D02ff5BF13'),
    },
  },
  [mainnet.id]: {
    eth: {
      [OrderDirection.Long]: getAddress('0xdB60626FF6cDC9dB07d3625A93d21dDf0f8A688C'),
      [OrderDirection.Short]: getAddress('0xfeD3E166330341e0305594B8c6e6598F9f4Cbe9B'),
    },
    msqth: {
      [OrderDirection.Long]: getAddress('0x60b24e58A46896724f8E2B18F18c801976d2b569'),
    },
  },
  [goerli.id]: {
    eth: {
      [OrderDirection.Short]: getAddress('0xe45602c350d99dcf00ef8f53430c6affd6b029aa'),
    },
    msqth: {
      [OrderDirection.Long]: getAddress('0x3a5358300bffcf2f13af8c6d2ede0e5580ded9d8'),
    },
  },
}

export const addressToAsset = (address: Address) => {
  for (const chainId of Object.keys(ChainMarkets)) {
    for (const asset of Object.keys(ChainMarkets[Number(chainId) as SupportedChainId])) {
      if (ChainMarkets[Number(chainId) as SupportedChainId][asset as SupportedAsset]?.Long === address) {
        return { asset: asset as SupportedAsset, direction: OrderDirection.Long }
      }
      if (ChainMarkets[Number(chainId) as SupportedChainId][asset as SupportedAsset]?.Short === address) {
        return { asset: asset as SupportedAsset, direction: OrderDirection.Short }
      }
    }
  }
}

export const ONLY_INCLUDE: { [chainId: number]: string[] | (`0x${string}` | undefined)[] } = {
  [mainnet.id]: [
    '0x60b24e58a46896724f8e2b18f18c801976d2b569'.toLowerCase(),
    '0xdb60626ff6cdc9db07d3625a93d21ddf0f8a688c'.toLowerCase(),
    '0xfed3e166330341e0305594b8c6e6598f9f4cbe9b'.toLowerCase(),
  ],
  [arbitrumGoerli.id]: Object.values(ChainMarkets[arbitrumGoerli.id])
    .map((x) => [x.Long, x.Short])
    .flat(),
  [arbitrum.id]: Object.values(ChainMarkets[arbitrum.id])
    .map((x) => [x.Long, x.Short])
    .flat(),
  [baseGoerli.id]: Object.values(ChainMarkets[baseGoerli.id])
    .map((x) => [x.Long, x.Short])
    .flat(),
}

export const MaxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
