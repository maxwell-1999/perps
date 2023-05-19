import { FixedNumber, formatUnits, WeiPerEther, parseEther } from "ethers";

// like formatEther but can specify num decimal places
export const formatFixed18 = (
  value: bigint,
  {
    numDecimals = 2,
    comma = true,
    strictSigFigs = false, // whether to enforce decimals even if they are trailing 0
  }: { numDecimals?: number; comma?: boolean; strictSigFigs?: boolean } = {},
) => {
  const valFixed = Big18Math.divFixed(value, Big18Math.ONE);
  const withDecimals = formatFixedDecimals(valFixed, { numDecimals, floor: false, comma });

  if (!strictSigFigs) {
    let res = withDecimals;
    while (res.endsWith("0")) res = res.slice(0, res.length - 1);
    if (res.endsWith(".")) res = `${res}0`;
    return res;
  }

  return withDecimals;
};

export const formatFixed18USDPrice = (
  value: bigint,
  { numDecimals = 2 }: { numDecimals?: number } = {},
) => {
  if (!value) return "$0.".padEnd(3 + numDecimals, "0");
  const fixedPrice = Big18Math.divFixed(value, Big18Math.ONE);
  const amountStr = formatFixedDecimals(fixedPrice, { numDecimals, floor: false, comma: true });
  if (amountStr.startsWith("-")) return `-$${amountStr.substring(1)}`;
  return `$${amountStr}`;
};

export const formatFixedDecimals = (
  num: FixedNumber,
  {
    floor = true,
    numDecimals = 6,
    comma = false,
  }: { floor?: boolean; numDecimals?: number; comma?: boolean } = {},
): string => {
  let amountStr = "";
  if (floor) {
    const str = num.round(numDecimals + 1).toString();
    amountStr = str.substring(0, str.length - 1); // Take off the last decimal to floor
  } else {
    amountStr = num.round(numDecimals).toFormat(`fixed128x${numDecimals}`).toString();
  }

  amountStr = comma ? amountStr : amountStr;
  const lengthBeforeDecimal = amountStr.substring(0, amountStr.indexOf(".") + 1).length;
  amountStr = amountStr.padEnd(lengthBeforeDecimal + numDecimals, "0");
  return amountStr;
};

export const formatPriceForDirection = (
  value: bigint,
  direction: bigint,
  { numDecimals = 2 }: { numDecimals?: number } = {},
) => {
  return formatFixed18USDPrice(Big18Math.isZero(direction) ? value : value * -1n, { numDecimals });
};

export const to18Decimals = (
  amount: bigint,
  { fromDecimals = 6 }: { fromDecimals?: number } = {},
): bigint => {
  return parseEther(formatUnits(amount, fromDecimals));
};

export class Big18Math {
  public static FIXED_DECIMALS = 18;
  public static FIXED_WIDTH = "fixed256x18";
  public static BASE = WeiPerEther;
  public static ZERO = 0n;
  public static ZERO_FIXED = Big18Math.fixedFrom(Big18Math.ZERO);
  public static ONE = 1n * Big18Math.BASE;
  public static ONE_FIXED = Big18Math.fixedFrom(Big18Math.ONE);

  public static mul(a: bigint, b: bigint): bigint {
    return (a * b) / this.BASE;
  }

  public static div(a: bigint, b: bigint): bigint {
    return (a * this.BASE) / b;
  }

  public static add(a: bigint, b: bigint): bigint {
    return a + b;
  }

  public static sub(a: bigint, b: bigint): bigint {
    return a - b;
  }

  public static divFixed(a: bigint, b: bigint): FixedNumber {
    return this.fixedFrom(a).divUnsafe(this.fixedFrom(b));
  }

  public static isZero(a: bigint): boolean {
    return this.ZERO === a;
  }

  public static eq(a: bigint, b: bigint): boolean {
    return a === b;
  }

  public static fixedFrom(a: bigint): FixedNumber {
    return FixedNumber.fromValue(a, Big18Math.FIXED_DECIMALS, Big18Math.FIXED_WIDTH);
  }
}
