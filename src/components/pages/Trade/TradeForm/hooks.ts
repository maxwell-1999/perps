import { useRef, useEffect } from "react";
import { useColorModeValue, useTheme } from "@chakra-ui/react";
import { useIntl } from "react-intl";
import { FormState } from "@/contexts/tradeFormContext";
import { L2SupportedAsset } from "@/constants/currencies";

type MarketChangeProps = {
  selectedMarket: L2SupportedAsset;
  formState: FormState;
  setTradeFormState: (state: FormState) => void;
};

export function useResetFormOnMarketChange({
  selectedMarket,
  formState,
  setTradeFormState,
}: MarketChangeProps) {
  const prevMarketRef = useRef(selectedMarket);

  useEffect(() => {
    if (prevMarketRef.current !== selectedMarket && formState !== FormState.trade) {
      setTradeFormState(FormState.trade);
    }
    prevMarketRef.current = selectedMarket;
  }, [selectedMarket, formState, setTradeFormState]);
}

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
    close: intl.formatMessage({ defaultMessage: "Close" }),
    modifyPosition: intl.formatMessage({ defaultMessage: "Modify position" }),
    cancel: intl.formatMessage({ defaultMessage: "Cancel" }),
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
