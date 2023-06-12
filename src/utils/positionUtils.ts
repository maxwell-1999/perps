import { PositionStatus } from '@/constants/markets'

import { IPerennialLens, PositionStructOutput, PrePositionStructOutput } from '@t/generated/LensAbi'
import { PositionSide } from '@t/gql/graphql'

import { Big18Math } from './big18Utils'

export function next(pre: PrePositionStructOutput, pos: PositionStructOutput) {
  return {
    maker: pos.maker + pre.openPosition.maker - pre.closePosition.maker,
    taker: pos.taker + pre.openPosition.taker - pre.closePosition.taker,
  } as PositionStructOutput
}

export function size(pos: PositionStructOutput) {
  return pos.maker || pos.taker || 0n
}

export function side(pos?: PositionStructOutput): PositionSide {
  if (pos && pos.maker > 0n) return PositionSide.Maker
  return PositionSide.Taker
}

export function add(a: PositionStructOutput, b: PositionStructOutput) {
  return {
    maker: a.maker + b.maker,
    taker: a.taker + b.taker,
  } as PositionStructOutput
}

export function utilization(pre: PrePositionStructOutput, pos: PositionStructOutput) {
  const nextPosition = next(pre, pos)
  if (nextPosition.maker === 0n) return Big18Math.ONE

  return Big18Math.min(Big18Math.ONE, Big18Math.div(nextPosition.taker, nextPosition.maker))
}

export function socialization(pre: PrePositionStructOutput, pos: PositionStructOutput) {
  const nextPosition = next(pre, pos)
  if (nextPosition.taker === 0n) return Big18Math.ONE

  return Big18Math.min(Big18Math.ONE, Big18Math.div(nextPosition.maker, nextPosition.taker))
}

// LiquidationPrice = ((position * abs(price) + collateral) / (position * (1 + maintenanceRatio))
export const calcLiquidationPrice = (
  product: IPerennialLens.ProductSnapshotStructOutput,
  userPosition: PositionStructOutput,
  collateral: bigint,
  userPositionDelta?: PositionStructOutput,
) => {
  if (!collateral || Big18Math.isZero(collateral) || !product.maintenance) return 0n

  const payoffDirection = product.productInfo.payoffDefinition.payoffDirection
  const [posSize, posSide] = [size(userPosition), side(userPosition)]
  if (Big18Math.isZero(posSize)) return 0n

  // If we have user position deltas, calculate next global position based on deltas
  const nextGlobalPosition = next(
    product.pre,
    userPositionDelta ? add(product.position, userPositionDelta) : product.position,
  )

  // Long Market, Maker Position takes Short exposure
  if (payoffDirection === 0n && posSide === 'maker')
    return calcLiquidationPriceShort(product, nextGlobalPosition, posSize, collateral, false)
  // Long Market, Taker Position takes Long exposure
  else if (payoffDirection === 0n && posSide === 'taker')
    return calcLiquidationPriceLong(product, nextGlobalPosition, posSize, collateral, true)
  // Short Market, Maker Position takes Long exposure
  else if (payoffDirection === 1n && posSide === 'maker')
    return calcLiquidationPriceLong(product, nextGlobalPosition, posSize, collateral, false)
  // Short Market, Taker Position takes Short exposure
  else if (payoffDirection === 1n && posSide === 'taker')
    return calcLiquidationPriceShort(product, nextGlobalPosition, posSize, collateral, true)

  return 0n
}

// LiquidationPrice = |(Collateral * Makers + Position * Takers * |Price|)/(Position * (Makers * Maintenance + Takers))|
export const calcLiquidationPriceShort = (
  product: IPerennialLens.ProductSnapshotStructOutput,
  productNextPosition: PositionStructOutput,
  userPosition: bigint,
  collateral: bigint,
  taker: boolean,
) => {
  // If this is a taker position, force utilization to 100%
  const next = taker ? { maker: Big18Math.ONE, taker: Big18Math.ONE } : productNextPosition
  if (Big18Math.isZero(next.maker)) return 0n

  let numerator = Big18Math.mul(collateral, next.maker)
  numerator = Big18Math.add(
    numerator,
    Big18Math.abs(Big18Math.mul(Big18Math.mul(userPosition, next.taker), product.latestVersion.price)),
  )

  let denominator = Big18Math.add(Big18Math.mul(next.maker, product.maintenance), next.taker)
  denominator = Big18Math.mul(denominator, userPosition)

  return Big18Math.abs(Big18Math.div(numerator, denominator))
}

// LiquidationPrice = |(Position * Takers * |Price| - Collateral * Makers) / (Position * (Makers * Maintenance - Takers))|
export const calcLiquidationPriceLong = (
  product: IPerennialLens.ProductSnapshotStructOutput,
  productNextPosition: PositionStructOutput,
  userPosition: bigint,
  collateral: bigint,
  taker: boolean,
) => {
  // If this is a taker position, force utilization to 100%
  const next = taker ? { maker: Big18Math.ONE, taker: Big18Math.ONE } : productNextPosition
  if (Big18Math.mul(next.maker, product.maintenance) > next.taker) return 0n
  if (Big18Math.isZero(next.maker)) return 0n

  let numerator = Big18Math.mul(collateral, next.maker)
  numerator = Big18Math.sub(
    Big18Math.abs(Big18Math.mul(Big18Math.mul(userPosition, next.taker), product.latestVersion.price)),
    numerator,
  )

  let denominator = Big18Math.sub(Big18Math.mul(next.maker, product.maintenance), next.taker)
  denominator = Big18Math.mul(denominator, userPosition)

  return Big18Math.abs(Big18Math.div(numerator, denominator))
}

export const positionStatus = (position: bigint, nextPosition: bigint, collateral: bigint) => {
  if (Big18Math.isZero(nextPosition) && !Big18Math.isZero(position)) {
    return PositionStatus.closing
  }
  if (Big18Math.isZero(nextPosition) && Big18Math.isZero(position) && !Big18Math.isZero(collateral)) {
    return PositionStatus.closed
  }
  if (!Big18Math.isZero(nextPosition) && Big18Math.isZero(position)) {
    return PositionStatus.opening
  }
  if (!Big18Math.isZero(nextPosition) && !Big18Math.isZero(position) && !Big18Math.eq(nextPosition, position)) {
    return PositionStatus.pricing
  }
  if (!Big18Math.isZero(nextPosition) && !Big18Math.isZero(position)) {
    return PositionStatus.open
  }
  return PositionStatus.resolved
}
