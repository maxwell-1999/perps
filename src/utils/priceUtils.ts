import { BigNumber, BigNumberish, constants, FixedNumber } from "ethers";
import { commify, formatUnits, parseEther } from "ethers/lib/utils";

// like formatEther but can specify num decimal places
export const formatFixed18 = (
  value: BigNumberish,
  numDecimals = 2,
  comma: boolean = true,
  strictSigFigs: boolean = false, // whether to enforce decimals even if they are trailing 0
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

export const formatFixed18USDPrice = (value?: BigNumberish, numDecimals = 2) => {
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
  }: { floor?: boolean; numDecimals?: number; comma?: boolean },
): string => {
  let amountStr = "";
  if (floor) {
    const str = num.round(numDecimals + 1).toString();
    amountStr = str.substring(0, str.length - 1); // Take off the last decimal to floor
  } else {
    amountStr = num.round(numDecimals).toFormat(`fixed128x${numDecimals}`).toString();
  }

  amountStr = comma ? commify(amountStr) : amountStr;
  const lengthBeforeDecimal = amountStr.substring(0, amountStr.indexOf(".") + 1).length;
  amountStr = amountStr.padEnd(lengthBeforeDecimal + numDecimals, "0");
  return amountStr;
};

export const formatPriceForDirection = (
  value: BigNumberish,
  direction: BigNumberish,
  numDecimals = 2,
) => {
  return formatFixed18USDPrice(
    Big18Math.isZero(direction) ? value : BigNumber.from(value).mul(-1),
    numDecimals,
  );
};

export const to18Decimals = (amount: BigNumberish, fromDecimals = 6): BigNumber => {
  return parseEther(formatUnits(amount, fromDecimals));
};

export class Big18Math {
  public static FIXED_WIDTH = "fixed256x18";
  public static BASE = constants.WeiPerEther;
  public static ZERO = BigNumber.from(0);
  public static ZERO_FIXED = FixedNumber.from(Big18Math.ZERO, Big18Math.FIXED_WIDTH);
  public static ONE = BigNumber.from(1).mul(this.BASE);
  public static ONE_FIXED = FixedNumber.from(Big18Math.ONE, Big18Math.FIXED_WIDTH);

  public static mul(a: BigNumberish, b: BigNumberish): BigNumber {
    return BigNumber.from(a).mul(b).div(this.BASE);
  }

  public static div(a: BigNumberish, b: BigNumberish): BigNumber {
    return BigNumber.from(a).mul(this.BASE).div(b);
  }

  public static add(a: BigNumberish, b: BigNumberish): BigNumber {
    return BigNumber.from(a).add(b);
  }

  public static sub(a: BigNumberish, b: BigNumberish): BigNumber {
    return BigNumber.from(a).sub(b);
  }

  public static divFixed(a: BigNumberish, b: BigNumberish): FixedNumber {
    return FixedNumber.from(a, Big18Math.FIXED_WIDTH).divUnsafe(
      FixedNumber.from(b, Big18Math.FIXED_WIDTH),
    );
  }

  public static isZero(a: BigNumberish): boolean {
    return this.ZERO.eq(a);
  }

  public static eq(a: BigNumberish, b: BigNumberish): boolean {
    return BigNumber.from(a).eq(b);
  }

  public static fixedFrom(a: BigNumberish): FixedNumber {
    return FixedNumber.from(a, Big18Math.FIXED_WIDTH);
  }
}
