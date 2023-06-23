import { MaxUint256 } from '@/constants/units'
import { Big18Math } from '@/utils/big18Utils'

export function formatValueForProgressBar(value: bigint, total: bigint) {
  if (Big18Math.eq(total, MaxUint256)) return 0
  return Math.floor(Big18Math.toUnsafeFloat(Big18Math.div(value, total)) * 100)
}
