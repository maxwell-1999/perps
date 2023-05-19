import { FixedNumber, WeiPerEther } from "ethers";

// Formats an 18 decimal bigint as a USD price
export const formatBig18USDPrice = (value: bigint = 0n) => {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    minimumSignificantDigits: 6,
    maximumSignificantDigits: 6,
    // @ts-ignore
    roundingPriority: "morePrecision",
  }).format(Big18Math.divFixed(value, Big18Math.ONE).toUnsafeFloat());
};

// Formats an 18 decimal bigint as a USD price
export const formatBig18Percent = (
  value: bigint = 0n,
  { numDecimals = 2 }: { numDecimals?: number } = {},
) => {
  return Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: numDecimals,
    maximumFractionDigits: numDecimals,
  }).format(Big18Math.divFixed(value, Big18Math.ONE).toUnsafeFloat());
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