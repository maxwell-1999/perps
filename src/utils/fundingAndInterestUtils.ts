import { ChainMarketSnapshot } from '@/hooks/markets2'

import { JumpRateUtilizationCurve } from '@t/perennial'

import { Big6Math } from './big6Utils'
import { nowSeconds } from './timeUtils'

export const computeInterestRate = (curve: JumpRateUtilizationCurve, utilization: bigint) => {
  if (utilization < Big6Math.ZERO) return curve.minRate

  if (utilization < curve.targetUtilization)
    return linearInterpolation(Big6Math.ZERO, curve.minRate, curve.targetUtilization, curve.targetRate, utilization)

  if (utilization < Big6Math.ONE)
    return linearInterpolation(curve.targetUtilization, curve.targetRate, Big6Math.ONE, curve.maxRate, utilization)

  return curve.maxRate
}

function linearInterpolation(startX: bigint, startY: bigint, endX: bigint, endY: bigint, targetX: bigint) {
  if (targetX < startX || targetX > endX) throw 'CurveMath18OutOfBoundsError'

  const xRange = endX - startX
  const yRange = endY - startY
  const xRatio = Big6Math.div(targetX - startX, xRange)
  return Big6Math.mul(yRange, xRatio) + startY
}

export function calculateFundingForSides(snapshot: ChainMarketSnapshot) {
  const {
    global: { pAccumulator },
    parameter: { fundingFee },
    riskParameter: { pController, utilizationCurve },
    position: { maker, long, short, timestamp },
  } = snapshot

  // Funding
  const timeDelta = BigInt(nowSeconds()) - timestamp
  const marketFunding = pAccumulator._value + Big6Math.mul(timeDelta, Big6Math.div(pAccumulator._skew, pController.k))
  const funding = Big6Math.max(Big6Math.min(marketFunding, pController.max), -pController.max)
  const major = Big6Math.max(long, short)
  const minor = Big6Math.min(long, short)
  // Interest
  const utilization = maker + minor > 0n ? Big6Math.div(major, maker + minor) : 0n
  const applicableNotional = Big6Math.min(maker, long + short)
  const interestRate = computeInterestRate(utilizationCurve, utilization)
  const interest = long + short > 0n ? Big6Math.mul(interestRate, Big6Math.div(applicableNotional, long + short)) : 0n

  const totalFundingFee = Big6Math.mul(Big6Math.abs(funding), fundingFee) / 2n
  const longRate = funding + totalFundingFee + interest
  const shortRate = -funding + totalFundingFee + interest

  return { long: longRate, short: shortRate }
}
