import ethLogo from "@public/icons/eth.png";

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
    icon: string;
  };
};

export const ASSET_METADATA: AssetMetadata = {
  btc: {
    symbol: "BTC-USD",
    name: "Bitcoin",
    displayDecimals: 2,
    tvTicker: "CRYPTO:BTCUSD",
    icon: ethLogo,
  },
  eth: {
    symbol: "ETH-USD",
    name: "Ethereum",
    displayDecimals: 2,
    tvTicker: "CRYPTO:ETHUSD",
    icon: ethLogo,
  },
  arb: {
    symbol: "ARB-USD",
    name: "Arbitrum",
    displayDecimals: 4,
    tvTicker: "CRYPTO:ARBIUSD",
    icon: ethLogo,
  },
  link: {
    symbol: "LINK-USD",
    name: "Chainlink",
    displayDecimals: 4,
    tvTicker: "CRYPTO:LINKUSD",
    icon: ethLogo,
  },
};
