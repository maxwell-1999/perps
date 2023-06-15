import { FixedNumber, WeiPerEther, formatUnits, parseEther } from 'ethers'

export const formatBig18 = (
  value: bigint = 0n,
  { numSigFigs = 2, useGrouping = true }: { numSigFigs?: number; useGrouping?: boolean | undefined } = {},
) => {
  return Intl.NumberFormat('en-US', {
    minimumSignificantDigits: numSigFigs,
    maximumSignificantDigits: numSigFigs,
    useGrouping,
  }).format(Big18Math.divFixed(value, Big18Math.ONE).toUnsafeFloat())
}

// Formats an 18 decimal bigint as a USD price
export const formatBig18USDPrice = (
  value: bigint = 0n,
  { compact = false, fromUsdc = false }: { compact?: boolean; fromUsdc?: boolean } = {},
) => {
  const valueToFormat = fromUsdc
    ? Number(formatUnits(value, 6))
    : Big18Math.divFixed(value, Big18Math.ONE).toUnsafeFloat()
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : undefined,
    minimumFractionDigits: compact ? 1 : 2,
    maximumFractionDigits: compact ? 1 : 2,
    minimumSignificantDigits: compact ? 2 : 6,
    maximumSignificantDigits: compact ? 2 : 6,
    // @ts-ignore
    roundingPriority: 'morePrecision',
  }).format(valueToFormat)
}

// Formats an 18 decimal bigint as a USD price
export const formatBig18Percent = (value: bigint = 0n, { numDecimals = 2 }: { numDecimals?: number } = {}) => {
  return Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: numDecimals,
    maximumFractionDigits: numDecimals,
  }).format(Big18Math.divFixed(value, Big18Math.ONE).toUnsafeFloat())
}
export class Big18Math {
  public static FIXED_DECIMALS = 18
  public static FIXED_WIDTH = 'fixed256x18'
  public static BASE = WeiPerEther
  public static ZERO = 0n
  public static ZERO_FIXED = Big18Math.fixedFrom(Big18Math.ZERO)
  public static ONE = 1n * Big18Math.BASE
  public static ONE_FIXED = Big18Math.fixedFrom(Big18Math.ONE)
  public static TWO = 2n * Big18Math.BASE

  public static mul(a: bigint, b: bigint): bigint {
    return (a * b) / this.BASE
  }

  public static div(a: bigint, b: bigint): bigint {
    return (a * this.BASE) / b
  }

  public static add(a: bigint, b: bigint): bigint {
    return a + b
  }

  public static sub(a: bigint, b: bigint): bigint {
    return a - b
  }

  public static subFixed(a: bigint, b: bigint): FixedNumber {
    return this.fixedFrom(a).subUnsafe(this.fixedFrom(b))
  }

  public static divFixed(a: bigint, b: bigint): FixedNumber {
    return this.fixedFrom(a).divUnsafe(this.fixedFrom(b))
  }

  public static isZero(a: bigint): boolean {
    return this.ZERO === a
  }

  public static eq(a: bigint, b: bigint): boolean {
    return a === b
  }

  public static abs(a: bigint): bigint {
    return a < 0n ? -a : a
  }

  public static max(a: bigint, b: bigint): bigint {
    return a >= b ? a : b
  }

  public static min(a: bigint, b: bigint): bigint {
    return a <= b ? a : b
  }

  public static cmp(a: bigint, b: bigint): number {
    return a === b ? 0 : a < b ? -1 : 1
  }

  public static fixedFrom(a: bigint): FixedNumber {
    return FixedNumber.fromValue(a, Big18Math.FIXED_DECIMALS, Big18Math.FIXED_WIDTH)
  }

  public static fromFloatString(a: string): bigint {
    if (!a || a === '.') return 0n
    return parseEther(a.replace(/','/g, '') as `${number}`)
  }

  public static toFloatString(a: bigint): string {
    return formatUnits(a, Big18Math.FIXED_DECIMALS)
  }

  public static fromDecimals(amount: bigint, decimals: number): bigint {
    return amount * 10n ** BigInt(Big18Math.FIXED_DECIMALS - decimals)
  }
}
