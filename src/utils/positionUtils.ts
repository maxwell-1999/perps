import colors from '@/components/design-system/theme/colors'
import { PositionStatus } from '@/constants/markets'

import { PositionSide } from '@t/gql/graphql'
import { Position, PrePosition, ProductSnapshot } from '@t/perennial'

import { Big18Math } from './big18Utils'

export function next(pre: PrePosition, pos: Position) {
  return {
    maker: pos.maker + pre.openPosition.maker - pre.closePosition.maker,
    taker: pos.taker + pre.openPosition.taker - pre.closePosition.taker,
  }
}

export function size(pos: Position) {
  return pos.maker || pos.taker || 0n
}

export function side(pos?: Position): PositionSide {
  if (pos && pos.maker > 0n) return PositionSide.Maker
  return PositionSide.Taker
}

export function add(a: Position, b: Position) {
  return {
    maker: a.maker + b.maker,
    taker: a.taker + b.taker,
  }
}

export function utilization(pre: PrePosition, pos: Position) {
  const nextPosition = next(pre, pos)
  if (nextPosition.maker === 0n) return Big18Math.ONE

  return Big18Math.min(Big18Math.ONE, Big18Math.div(nextPosition.taker, nextPosition.maker))
}

export function socialization(pre: PrePosition, pos: Position) {
  const nextPosition = next(pre, pos)
  if (nextPosition.taker === 0n) return Big18Math.ONE

  return Big18Math.min(Big18Math.ONE, Big18Math.div(nextPosition.maker, nextPosition.taker))
}

// LiquidationPrice = ((position * abs(price) + collateral) / (position * (1 + maintenanceRatio))
export const calcLiquidationPrice = (
  product: ProductSnapshot,
  userPosition: Position,
  collateral: bigint,
  userPositionDelta?: Position,
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
  if (payoffDirection === 0 && posSide === 'maker')
    return calcLiquidationPriceShort(product, nextGlobalPosition, posSize, collateral, false)
  // Long Market, Taker Position takes Long exposure
  else if (payoffDirection === 0 && posSide === 'taker')
    return calcLiquidationPriceLong(product, nextGlobalPosition, posSize, collateral, true)
  // Short Market, Maker Position takes Long exposure
  else if (payoffDirection === 1 && posSide === 'maker')
    return calcLiquidationPriceLong(product, nextGlobalPosition, posSize, collateral, false)
  // Short Market, Taker Position takes Short exposure
  else if (payoffDirection === 1 && posSide === 'taker')
    return calcLiquidationPriceShort(product, nextGlobalPosition, posSize, collateral, true)

  return 0n
}

// LiquidationPrice = |(Collateral * Makers + Position * Takers * |Price|)/(Position * (Makers * Maintenance + Takers))|
export const calcLiquidationPriceShort = (
  product: ProductSnapshot,
  productNextPosition: Position,
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
  product: ProductSnapshot,
  productNextPosition: Position,
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

export const calcLeverage = (price: bigint, position: bigint, collateral: bigint) => {
  if (Big18Math.isZero(collateral)) return 0n
  return Big18Math.div(Big18Math.mul(Big18Math.abs(price), position), collateral)
}

export const calcExposure = (userPosition: bigint, globalPosition: Position) => {
  if (Big18Math.isZero(globalPosition.maker)) return Big18Math.ZERO

  return Big18Math.div(Big18Math.mul(userPosition, globalPosition.taker), globalPosition.maker)
}

export const getStatusDetails = (status: PositionStatus) => {
  const isOpenPosition =
    status === PositionStatus.open ||
    status === PositionStatus.pricing ||
    status === PositionStatus.closing ||
    status === PositionStatus.opening
  const isTransitionPosition =
    status === PositionStatus.pricing || status === PositionStatus.opening || status === PositionStatus.closing
  const statusColor = isOpenPosition ? (isTransitionPosition ? 'goldenRod' : colors.brand.green) : 'darkGray'

  return { isOpenPosition, isTransitionPosition, statusColor }
}

export const closedOrResolved = (status?: PositionStatus) =>
  status && [PositionStatus.closed, PositionStatus.resolved].includes(status)
