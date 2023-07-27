import arbLogo from '@public/icons/arb.png'
import btcLogo from '@public/icons/btc.png'
import linkLogo from '@public/icons/chainlink.png'
import ethLogo from '@public/icons/eth.png'

export enum SupportedAsset {
  btc = 'btc',
  eth = 'eth',
  arb = 'arb',
  link = 'link',
  msqth = 'msqth',
}

export enum QuoteCurrency {
  usd = 'usd',
}

export enum Currency {
  USDC = 'USDC',
  DSU = 'DSU',
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
  },
  msqth: {
    symbol: 'MSQTH-USD',
    name: 'milli-Squeeth',
    displayDecimals: 4,
    tvTicker: 'Crypto.ETH/USD',
    icon: ethLogo,
    baseCurrency: SupportedAsset.msqth,
    quoteCurrency: QuoteCurrency.usd,
  },
}
