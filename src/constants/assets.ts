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

export type AssetMetadata = {
  [asset in SupportedAsset]: {
    name: string
    symbol: string
    displayDecimals: number
    tvTicker: string
    icon: string
    baseCurrency: SupportedAsset
    quoteCurrency: QuoteCurrency
  }
}

export const AssetMetadata: AssetMetadata = {
  btc: {
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    displayDecimals: 2,
    tvTicker: 'CRYPTO:BTCUSD',
    icon: ethLogo,
    baseCurrency: SupportedAsset.btc,
    quoteCurrency: QuoteCurrency.usd,
  },
  eth: {
    symbol: 'ETH-USD',
    name: 'Ethereum',
    displayDecimals: 2,
    tvTicker: 'CRYPTO:ETHUSD',
    icon: ethLogo,
    baseCurrency: SupportedAsset.eth,
    quoteCurrency: QuoteCurrency.usd,
  },
  arb: {
    symbol: 'ARB-USD',
    name: 'Arbitrum',
    displayDecimals: 4,
    tvTicker: 'CRYPTO:ARBIUSD',
    icon: ethLogo,
    baseCurrency: SupportedAsset.arb,
    quoteCurrency: QuoteCurrency.usd,
  },
  link: {
    symbol: 'LINK-USD',
    name: 'Chainlink',
    displayDecimals: 4,
    tvTicker: 'CRYPTO:LINKUSD',
    icon: ethLogo,
    baseCurrency: SupportedAsset.link,
    quoteCurrency: QuoteCurrency.usd,
  },
  msqth: {
    symbol: 'MSQTH-USD',
    name: 'milli-Squeeth',
    displayDecimals: 4,
    tvTicker: 'CRYPTO:MSQTHUSD',
    icon: ethLogo,
    baseCurrency: SupportedAsset.msqth,
    quoteCurrency: QuoteCurrency.usd,
  },
}
