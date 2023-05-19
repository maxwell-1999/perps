import ethLogo from "@public/icons/eth.png";

export enum L2SupportedAsset {
  btc = "btc",
  eth = "eth",
  arb = "arb",
  link = "link",
}

export enum BaseCurrency {
  usd = "usd",
}

export type AssetMetadata = {
  [asset in L2SupportedAsset]: {
    name: string;
    symbol: string;
    displayDecimals: number;
    tvTicker: string;
    icon: string;
    baseCurrency: BaseCurrency;
    quoteCurrency: L2SupportedAsset;
  };
};

export const ASSET_METADATA: AssetMetadata = {
  btc: {
    symbol: "BTC-USD",
    name: "Bitcoin",
    displayDecimals: 2,
    tvTicker: "CRYPTO:BTCUSD",
    baseCurrency: BaseCurrency.usd,
    quoteCurrency: L2SupportedAsset.btc,
    icon: ethLogo,
  },
  eth: {
    symbol: "ETH-USD",
    name: "Ethereum",
    displayDecimals: 2,
    tvTicker: "CRYPTO:ETHUSD",
    baseCurrency: BaseCurrency.usd,
    quoteCurrency: L2SupportedAsset.eth,
    icon: ethLogo,
  },
  arb: {
    symbol: "ARB-USD",
    name: "Arbitrum",
    displayDecimals: 4,
    tvTicker: "CRYPTO:ARBIUSD",
    baseCurrency: BaseCurrency.usd,
    quoteCurrency: L2SupportedAsset.arb,
    icon: ethLogo,
  },
  link: {
    symbol: "LINK-USD",
    name: "Chainlink",
    displayDecimals: 4,
    tvTicker: "CRYPTO:LINKUSD",
    baseCurrency: BaseCurrency.usd,
    quoteCurrency: L2SupportedAsset.link,
    icon: ethLogo,
  },
};
