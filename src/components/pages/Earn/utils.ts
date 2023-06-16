import { Big18Math } from '@/utils/big18Utils'

import { PositionStructOutput } from '@t/generated/LensAbi'

export function formatValueForProgressBar(value: bigint, total: bigint) {
  return Math.floor(Big18Math.divFixed(value, total).toUnsafeFloat() * 100)
}

export const calcExposure = (userPosition: bigint, globalPosition: PositionStructOutput) => {
  if (Big18Math.isZero(globalPosition.maker)) return Big18Math.ZERO

  return Big18Math.div(Big18Math.mul(userPosition, globalPosition.taker), globalPosition.maker)
}
