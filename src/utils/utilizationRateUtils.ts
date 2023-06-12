import { JumpRateUtilizationCurveStructOutput } from '@t/generated/LensAbi'

import { Big18Math } from './big18Utils'

export const computeFundingRate = (curve: JumpRateUtilizationCurveStructOutput, utilization: bigint) => {
  if (utilization < Big18Math.ZERO) return curve.minRate

  if (utilization < curve.targetUtilization)
    return linearInterpolation(Big18Math.ZERO, curve.minRate, curve.targetUtilization, curve.targetRate, utilization)

  if (utilization < Big18Math.ONE)
    return linearInterpolation(curve.targetUtilization, curve.targetRate, Big18Math.ONE, curve.maxRate, utilization)

  return curve.maxRate
}

function linearInterpolation(startX: bigint, startY: bigint, endX: bigint, endY: bigint, targetX: bigint) {
  if (targetX < startX || targetX > endX) throw 'CurveMath18OutOfBoundsError'

  const xRange = endX - startX
  const yRange = endY - startY
  const xRatio = Big18Math.div(targetX - startX, xRange)
  return Big18Math.mul(yRange, xRatio) + startY
}
