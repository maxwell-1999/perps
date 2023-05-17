import { IntlShape } from "react-intl";

export const getSelectorCopy = (intl: IntlShape) => ({
  switchMarket: intl.formatMessage({ defaultMessage: "Switch market" }),
  market: intl.formatMessage({ defaultMessage: "Market" }),
  priceLiquidity: intl.formatMessage({ defaultMessage: "Price / Liquidity" }),
});

export const getMarketBarCopy = (intl: IntlShape) => ({
  change: intl.formatMessage({ defaultMessage: "Change" }),
  hourlyFunding: intl.formatMessage({ defaultMessage: "Hourly funding" }),
  low: intl.formatMessage({ defaultMessage: "24h low" }),
  high: intl.formatMessage({ defaultMessage: "24h high" }),
  volume: intl.formatMessage({ defaultMessage: "24h volume" }),
  openInterest: intl.formatMessage({ defaultMessage: "Open interest" }),
});
