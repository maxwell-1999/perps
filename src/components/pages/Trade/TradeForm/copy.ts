import { IntlShape } from "react-intl";

export const getTradeFormCopy = (intl: IntlShape) => ({
  trade: intl.formatMessage({ defaultMessage: "Trade" }),
  max: intl.formatMessage({ defaultMessage: "Max" }),
  addCollateral: intl.formatMessage({ defaultMessage: "Add collateral" }),
  leverage: intl.formatMessage({ defaultMessage: "Leverage" }),
  placeTrade: intl.formatMessage({ defaultMessage: "Place trade" }),
});

export const getReceiptCopy = (intl: IntlShape) => ({
  entryExit: intl.formatMessage({ defaultMessage: "Entry / Exit" }),
  priceImpact: intl.formatMessage({ defaultMessage: "Price impact" }),
  liquidationPrice: intl.formatMessage({ defaultMessage: "Liquidation price" }),
  tradingFee: intl.formatMessage({ defaultMessage: "Trading fee" }),
});
