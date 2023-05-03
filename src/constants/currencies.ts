export enum CryptoCurrencies {
  BTC = "BTC",
  ETH = "ETH",
  ARB = "ARB",
  USDC = "USDC",
}

export enum FiatCurrencies {
  USD = "USD",
}

export const isFiat = (currency: string) =>
  Object.values(FiatCurrencies).includes(currency as FiatCurrencies);

export const isDollar = (currency: string) =>
  [FiatCurrencies.USD, CryptoCurrencies.USDC].includes(currency as any);

export const isCrypto = (currency: string) =>
  Object.values(CryptoCurrencies).includes(currency as CryptoCurrencies);

// TODO: decimal places for currencies?
export const currencyDetails = {
  [CryptoCurrencies.BTC]: {
    symbol: "BTC",
    name: "Bitcoin",
    decimalPlaces: 8,
  },
  [CryptoCurrencies.ETH]: {
    symbol: "ETH",
    name: "Ethereum",
    decimalPlaces: 18,
  },
  [CryptoCurrencies.ARB]: {
    symbol: "ARB",
    name: "Arbitrum",
    decimalPlaces: 18,
  },
  [CryptoCurrencies.USDC]: {
    symbol: "USDC",
    name: "USD Coin",
    decimalPlaces: 6,
  },
  [FiatCurrencies.USD]: {
    symbol: "$",
    name: "US Dollar",
    decimalPlaces: 2,
  },
};
