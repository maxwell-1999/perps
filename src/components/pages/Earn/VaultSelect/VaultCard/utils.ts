import { Big18Math } from '@/utils/big18Utils'

export function formatValueForProgressBar(value: bigint, total: bigint) {
  const outOf100 = Big18Math.mul(Big18Math.div(value, total), Big18Math.fromFloatString('100'))
  return Math.floor(Big18Math.fixedFrom(outOf100).toUnsafeFloat())
}
