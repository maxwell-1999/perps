import { useIntl } from "react-intl";

export const useSelectorCopy = () => {
  const intl = useIntl();
  return {
    switchMarket: intl.formatMessage({ defaultMessage: "Switch market" }),
    market: intl.formatMessage({ defaultMessage: "Market" }),
    priceLiquidity: intl.formatMessage({ defaultMessage: "Price / Liquidity" }),
  };
};

export const useMarketBarCopy = () => {
  const intl = useIntl();
  return {
    change: intl.formatMessage({ defaultMessage: "Change" }),
    hourlyFunding: intl.formatMessage({ defaultMessage: "Hourly funding" }),
    low: intl.formatMessage({ defaultMessage: "24h low" }),
    high: intl.formatMessage({ defaultMessage: "24h high" }),
    volume: intl.formatMessage({ defaultMessage: "24h volume" }),
    openInterest: intl.formatMessage({ defaultMessage: "Open interest" }),
  };
};
