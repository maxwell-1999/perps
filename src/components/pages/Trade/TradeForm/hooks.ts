import { useColorModeValue, useTheme } from "@chakra-ui/react";
import { useIntl } from "react-intl";

export function useStyles() {
  const { colors } = useTheme();
  const textColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50]);
  const textBtnColor = colors.brand.purple[300];
  const textBtnHoverColor = colors.brand.purple[250];

  return {
    textColor,
    textBtnColor,
    textBtnHoverColor,
  };
}

export function useTradeFormCopy() {
  const intl = useIntl();
  return {
    trade: intl.formatMessage({ defaultMessage: "Trade" }),
    max: intl.formatMessage({ defaultMessage: "Max" }),
    addCollateral: intl.formatMessage({ defaultMessage: "Add collateral" }),
    leverage: intl.formatMessage({ defaultMessage: "Leverage" }),
    placeTrade: intl.formatMessage({ defaultMessage: "Place trade" }),
  };
}

export function useReceiptCopy() {
  const intl = useIntl();
  return {
    entryExit: intl.formatMessage({ defaultMessage: "Entry / Exit" }),
    priceImpact: intl.formatMessage({ defaultMessage: "Price impact" }),
    liquidationPrice: intl.formatMessage({ defaultMessage: "Liquidation price" }),
    tradingFee: intl.formatMessage({ defaultMessage: "Trading fee" }),
  };
}
