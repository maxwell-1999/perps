export enum L2SupportedAsset {
  btc = "btc",
  eth = "eth",
  arb = "arb",
  link = "link",
}

export type AssetMetadata = {
  [asset in L2SupportedAsset]: {
    name: string;
    symbol: string;
    displayDecimals: number;
    tvTicker: string;
  };
};

export const ASSET_METADATA: AssetMetadata = {
  btc: {
    symbol: "BTC",
    name: "Bitcoin",
    displayDecimals: 2,
    tvTicker: "CRYPTO:BTCUSD",
  },
  eth: {
    symbol: "ETH",
    name: "Ethereum",
    displayDecimals: 2,
    tvTicker: "CRYPTO:ETHUSD",
  },
  arb: {
    symbol: "ARB",
    name: "Arbitrum",
    displayDecimals: 4,
    tvTicker: "CRYPTO:ARBIUSD",
  },
  link: {
    symbol: "LINK",
    name: "USD Coin",
    displayDecimals: 4,
    tvTicker: "CRYPTO:LINKUSD",
  },
};
