import { IntlShape } from "react-intl";

export const getNavCopy = (intl: IntlShape) => ({
  menu: intl.formatMessage({ defaultMessage: "Menu" }),
  perennial: intl.formatMessage({ defaultMessage: "Perennial" }),
  settings: intl.formatMessage({ defaultMessage: "Settings" }),
  close: intl.formatMessage({ defaultMessage: "Close" }),
  home: intl.formatMessage({ defaultMessage: "Home" }),
  connect: intl.formatMessage({ defaultMessage: "Connect" }),
});
