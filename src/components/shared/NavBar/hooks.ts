import { useIntl } from "react-intl";

export const useNavCopy = () => {
  const intl = useIntl();
  return {
    menu: intl.formatMessage({ defaultMessage: "Menu" }),
    perennial: intl.formatMessage({ defaultMessage: "Perennial" }),
    settings: intl.formatMessage({ defaultMessage: "Settings" }),
    close: intl.formatMessage({ defaultMessage: "Close" }),
    home: intl.formatMessage({ defaultMessage: "Home" }),
    connect: intl.formatMessage({ defaultMessage: "Connect" }),
  };
};
