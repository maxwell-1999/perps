import { isFiat, CryptoCurrencies, FiatCurrencies } from "../constants/currencies";

interface MoneyProps {
  value: number | string;
  currency?: FiatCurrencies | CryptoCurrencies | string;
  hideTail?: boolean;
  minDecimals?: number;
  maxDecimals?: number;
}
// TODO: add support for large numbers
export const Money: React.FC<MoneyProps> = ({
  value,
  currency,
  hideTail,
  minDecimals = 2,
  maxDecimals = 6,
}) => {
  const numValue = Number(value);
  if (isNaN(numValue)) return null;

  const numberFormatOpts: Intl.NumberFormatOptions = {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
    style: currency && isFiat(currency) ? "currency" : undefined,
    currency: currency && isFiat(currency) ? currency : undefined,
  };

  const formattedNumber = formatNumber(numValue, numberFormatOpts);

  return (
    <span>
      {formattedNumber}
      {currency && !hideTail && !isFiat(currency) && (
        <>
          {" "}
          <span>{currency}</span>
        </>
      )}
    </span>
  );
};

function formatNumber(value: number, options: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", options).format(value);
}
