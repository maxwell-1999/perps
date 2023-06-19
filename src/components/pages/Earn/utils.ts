import { MaxUint256 } from 'ethers'

import { Big18Math } from '@/utils/big18Utils'

export function formatValueForProgressBar(value: bigint, total: bigint) {
  if (Big18Math.eq(total, MaxUint256)) return 0
  return Math.floor(Big18Math.divFixed(value, total).toUnsafeFloat() * 100)
}
