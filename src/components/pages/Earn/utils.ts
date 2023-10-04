import { MaxUint256 } from '@/constants/units'
import { Big6Math } from '@/utils/big6Utils'

export function formatValueForProgressBar(value?: bigint, total?: bigint) {
  if (!value || !total) return 0
  if (Big6Math.eq(total, MaxUint256)) return 0
  return Math.floor(Big6Math.toUnsafeFloat(Big6Math.div(value, total)) * 100)
}
