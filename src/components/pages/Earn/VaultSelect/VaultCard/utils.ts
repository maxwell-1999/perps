import { Big18Math } from '@/utils/big18Utils'

export function formatValueForProgressBar(value: bigint, total: bigint) {
  return Math.floor(Big18Math.divFixed(value, total).toUnsafeFloat() * 100)
}
