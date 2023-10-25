import arbLogo from '@public/icons/arb.png'
import btcLogo from '@public/icons/btc.png'
import linkLogo from '@public/icons/chainlink.png'
import ethLogo from '@public/icons/eth.png'
import polygonLogo from '@public/icons/polygon.png'
import solanaLogo from '@public/icons/solana.png'
import { Address, getAddress } from 'viem'
import { arbitrum, arbitrumGoerli, baseGoerli } from 'wagmi/chains'

import { SupportedChainId } from '@/constants/network'
import { notEmpty } from '@/utils/arrayUtils'
import { linearTransform, milliPowerTwoTransform } from '@/utils/payoffUtils'

export enum SupportedAsset {
  btc = 'btc',
  eth = 'eth',
  arb = 'arb',
  link = 'link',
  msqth = 'msqth',
  sol = 'sol',
  matic = 'matic',
}

export enum QuoteCurrency {
  usd = 'usd',
}

export enum Currency {
  USDC = 'USDC',
  DSU = 'DSU',
}

export enum PositionSide2 {
  maker = 'maker',
  long = 'long',
  short = 'short',
  none = 'none',
}

export enum PositionStatus {
  open = 'open',
  closed = 'closed',
  opening = 'opening',
  closing = 'closing',
  pricing = 'pricing',
  resolved = 'noValue',
  failed = 'failed',
  syncError = 'syncError',
}

export type AssetMetadata = {
  [asset in SupportedAsset]: {
    name: string
    symbol: string
    displayDecimals: number
    tvTicker: string
    icon: string
    baseCurrency: SupportedAsset
    quoteCurrency: QuoteCurrency
    pythFeedId?: string
    pythFeedIdTestnet?: string
    transform: (value: bigint) => bigint
  }
}

export const AssetMetadata: AssetMetadata = {
  btc: {
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    displayDecimals: 2,
    tvTicker: 'Crypto.BTC/USD',
    icon: btcLogo,
    baseCurrency: SupportedAsset.btc,
    quoteCurrency: QuoteCurrency.usd,
    pythFeedId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    pythFeedIdTestnet: '0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b',
    transform: linearTransform,
  },
  eth: {
    symbol: 'ETH-USD',
    name: 'Ethereum',
    displayDecimals: 6,
    tvTicker: 'Crypto.ETH/USD',
    icon: ethLogo,
    baseCurrency: SupportedAsset.eth,
    quoteCurrency: QuoteCurrency.usd,
    pythFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    pythFeedIdTestnet: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    transform: linearTransform,
  },
  arb: {
    symbol: 'ARB-USD',
    name: 'Arbitrum',
    displayDecimals: 4,
    tvTicker: 'Crypto.ARB/USD',
    icon: arbLogo,
    baseCurrency: SupportedAsset.arb,
    quoteCurrency: QuoteCurrency.usd,
    pythFeedId: '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',
    pythFeedIdTestnet: '0x37f40d2898159e8f2e52b93cb78f47cc3829a31e525ab975c49cc5c5d9176378',
    transform: linearTransform,
  },
  link: {
    symbol: 'LINK-USD',
    name: 'Chainlink',
    displayDecimals: 4,
    tvTicker: 'Crypto.LINK/USD',
    icon: linkLogo,
    baseCurrency: SupportedAsset.link,
    quoteCurrency: QuoteCurrency.usd,
    pythFeedId: '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
    pythFeedIdTestnet: '0x83be4ed61dd8a3518d198098ce37240c494710a7b9d85e35d9fceac21df08994',
    transform: linearTransform,
  },
  msqth: {
    symbol: 'MSQTH-USD',
    name: 'milli-Squeeth',
    displayDecimals: 4,
    tvTicker: 'Crypto.ETH/USD',
    icon: ethLogo,
    baseCurrency: SupportedAsset.msqth,
    quoteCurrency: QuoteCurrency.usd,
    pythFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    pythFeedIdTestnet: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    transform: milliPowerTwoTransform,
  },
  sol: {
    symbol: 'SOL-USD',
    name: 'Solana',
    displayDecimals: 4,
    tvTicker: 'Crypto.SOL/USD',
    icon: solanaLogo,
    baseCurrency: SupportedAsset.sol,
    quoteCurrency: QuoteCurrency.usd,
    pythFeedId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    pythFeedIdTestnet: '0xfe650f0367d4a7ef9815a593ea15d36593f0643aaaf0149bb04be67ab851decd',
    transform: linearTransform,
  },
  matic: {
    symbol: 'MATIC-USD',
    name: 'Polygon',
    displayDecimals: 6,
    tvTicker: 'Crypto.MATIC/USD',
    icon: polygonLogo,
    baseCurrency: SupportedAsset.matic,
    quoteCurrency: QuoteCurrency.usd,
    pythFeedId: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
    pythFeedIdTestnet: '0xd2c2c1f2bba8e0964f9589e060c2ee97f5e19057267ac3284caef3bd50bd2cb5',
    transform: linearTransform,
  },
}

export const ChainMarkets: {
  [chainId in SupportedChainId]: {
    [asset in SupportedAsset]?: { [PositionSide2.long]?: Address; [PositionSide2.short]?: Address }
  }
} = {
  [arbitrumGoerli.id]: {
    btc: {
      [PositionSide2.long]: getAddress('0x6d13f98eb8c6625846fc3d6cdaab455eedc64b45'),
      [PositionSide2.short]: getAddress('0xE442047148ACc3Df089500FC380bAAE8fF375AA4'),
    },
    eth: {
      [PositionSide2.long]: getAddress('0x798B31664ec791258E78FE66CFFDE5855A6f3dCf'),
      [PositionSide2.short]: getAddress('0x3354d131ec11511023d29b75cc6717b099220cff'),
    },
    link: {
      [PositionSide2.long]: getAddress('0x995d27c9a558dc3f9575df58933ab07effd2cf11'),
      [PositionSide2.short]: getAddress('0x6cf77dada031c5eb8fb31fc9bccf9319c1e218ef'),
    },
  },
  [arbitrum.id]: {
    eth: {
      [PositionSide2.long]: getAddress('0x260422c091da8c88ef21f5d1112ab43aa94787cd'),
      [PositionSide2.short]: getAddress('0x5b99d122af97ba012aa237bd01577278bfaaff1e'),
    },
    arb: {
      [PositionSide2.long]: getAddress('0x5E660B7B8357059241EAEc143e1e68A5A108D035'),
      [PositionSide2.short]: getAddress('0x4e67a8a428206Af5a6AC00Ba08a67Ce827182985'),
    },
  },
  [baseGoerli.id]: {
    eth: {
      [PositionSide2.long]: getAddress('0xace78035e5C3348BbB31c6dbF90B0Ef4CbEE9bAE'),
      [PositionSide2.short]: getAddress('0x3C1FC9E9a9b5b014B53c571f422E32D02ff5BF13'),
    },
  },
}

export const ChainMarkets2: {
  [chainId in SupportedChainId]: {
    [asset in SupportedAsset]?: Address
  }
} = {
  [arbitrumGoerli.id]: {
    eth: getAddress('0xf5Ae549Af3b600086F555aA4e41f3BB8A2EfEf4c'),
    btc: getAddress('0x55Dc0A47Eb29D8dbeADECf864c7dD64196eFF2a2'),
    sol: getAddress('0x4443Ec03A347394D2CA331638B809A17617497af'),
    matic: getAddress('0x40a4b331E95D409cC9CEdDcA9eFDf5ff58da4344'),
  },
  [arbitrum.id]: {
    eth: getAddress('0x90A664846960AaFA2c164605Aebb8e9Ac338f9a0'),
    btc: getAddress('0xcC83e3cDA48547e3c250a88C8D5E97089Fd28F60'),
    sol: getAddress('0x02258bE4ac91982dc1AF7a3D2C4F05bE6079C253'),
    matic: getAddress('0x7e34B5cBc6427Bd53ECFAeFc9AC2Cad04e982f78'),
  },
  [baseGoerli.id]: {},
}

export const chainAssetsWithAddress = (chainId: SupportedChainId) => {
  return Object.entries(ChainMarkets2[chainId])
    .map(([asset, marketAddress]) => (!!marketAddress ? { asset, marketAddress } : null))
    .filter(notEmpty)
}

export const addressToAsset = (address: Address) => {
  for (const chainId of Object.keys(ChainMarkets)) {
    for (const asset of Object.keys(ChainMarkets[Number(chainId) as SupportedChainId])) {
      if (ChainMarkets[Number(chainId) as SupportedChainId][asset as SupportedAsset]?.long === address) {
        return { asset: asset as SupportedAsset, direction: PositionSide2.long }
      }
      if (ChainMarkets[Number(chainId) as SupportedChainId][asset as SupportedAsset]?.short === address) {
        return { asset: asset as SupportedAsset, direction: PositionSide2.short }
      }
    }
  }
}

export const addressToAsset2 = (address: Address) => {
  for (const chainId of Object.keys(ChainMarkets2)) {
    for (const asset of Object.keys(ChainMarkets2[Number(chainId) as SupportedChainId])) {
      if (ChainMarkets2[Number(chainId) as SupportedChainId][asset as SupportedAsset] === address) {
        return asset as SupportedAsset
      }
    }
  }
}

export enum TriggerComparison {
  lte = 'lte',
  gte = 'gte',
}
