import colors from '@/components/design-system/theme/colors'
import { OrderValues } from '@/components/pages/Trade/TradeForm/constants'
import { PositionSide2, PositionStatus, SupportedAsset } from '@/constants/markets'
import { SupportedChainId, interfaceFeeBps } from '@/constants/network'
import { MaxUint256 } from '@/constants/units'
import { ProductSnapshotWithTradeLimitations } from '@/hooks/markets'
import { MarketSnapshot, MarketSnapshots, UserMarketSnapshot } from '@/hooks/markets2'

import { PositionSide } from '@t/gql/graphql'
import { Position, PrePosition, ProductSnapshot, UserProductSnapshot } from '@t/perennial'

import { Big6Math, formatBig6Percent } from './big6Utils'
import { Big18Math } from './big18Utils'
import { computeInterestRate } from './fundingAndInterestUtils'
import { Day, Hour, Year } from './timeUtils'

export const UpdateNoOp = MaxUint256

export function next(pre: PrePosition, pos: Position) {
  return {
    maker: pos.maker + pre.openPosition.maker - pre.closePosition.maker,
    taker: pos.taker + pre.openPosition.taker - pre.closePosition.taker,
  }
}

export function size(pos: Position) {
  return pos.maker || pos.taker || 0n
}

export function magnitude(maker: bigint | string, long: bigint | string, short: bigint | string) {
  return Big6Math.max(BigInt(maker), Big6Math.max(BigInt(long), BigInt(short)))
}

export function side(pos?: Position): PositionSide {
  if (pos && pos.maker > 0n) return PositionSide.Maker
  return PositionSide.Taker
}

export function side2(maker: bigint | string, long: bigint | string, short: bigint | string): PositionSide2 {
  if (BigInt(maker) > 0n) return PositionSide2.maker
  if (BigInt(long) > 0n) return PositionSide2.long
  if (BigInt(short) > 0n) return PositionSide2.short

  return PositionSide2.none
}

export function add(a: Position, b: Position) {
  return {
    maker: a.maker + b.maker,
    taker: a.taker + b.taker,
  }
}

export function utilization(pre: PrePosition, pos: Position) {
  const nextPosition = next(pre, pos)
  if (nextPosition.maker === 0n) return Big6Math.ONE

  return Big6Math.min(Big6Math.ONE, Big6Math.div(nextPosition.taker, nextPosition.maker))
}

export function socialization(pre: PrePosition, pos: Position) {
  const nextPosition = next(pre, pos)
  if (nextPosition.taker === 0n) return Big6Math.ONE

  return Big6Math.min(Big6Math.ONE, Big6Math.div(nextPosition.maker, nextPosition.taker))
}

export function efficiency(maker: bigint, major: bigint) {
  return major > 0n ? Big6Math.min(Big6Math.div(maker, major), Big6Math.ONE) : Big6Math.ONE
}

// LiquidationPrice = ((position * abs(price) + collateral) / (position * (1 + maintenanceRatio))
export const calcLiquidationPrice = ({
  marketSnapshot,
  collateral,
  position,
}: {
  marketSnapshot?: MarketSnapshot
  collateral?: bigint
  position?: bigint
}) => {
  const noValue = { long: 0n, short: 0n }
  if (!collateral || !marketSnapshot || !position) return noValue

  const notional = calcNotional(position, marketSnapshot.global.latestPrice)
  const maintenance = Big6Math.mul(notional, marketSnapshot.riskParameter.maintenance)

  // If maintenance is less than minMaintenance, then the liquidation calc is slightly simplified:
  // LiqPrice = ((minMaintenance - collateral) / (position * (long ? 1 : -1)) + price
  if (maintenance < marketSnapshot.riskParameter.minMaintenance) {
    const minMaintenanceLiqPriceLong = Big6Math.abs(
      Big6Math.div(marketSnapshot.riskParameter.minMaintenance - collateral, position) +
        marketSnapshot.global.latestPrice,
    )
    const minMaintenanceLiqPriceShort = Big6Math.abs(
      Big6Math.div(marketSnapshot.riskParameter.minMaintenance - collateral, position * -1n) +
        marketSnapshot.global.latestPrice,
    )
    return { long: minMaintenanceLiqPriceLong, short: minMaintenanceLiqPriceShort }
  }

  const longNumerator = Big6Math.sub(notional, collateral)
  const longDenominator = Big6Math.mul(position, Big6Math.sub(marketSnapshot.riskParameter.maintenance, Big6Math.ONE))
  const long = Big6Math.abs(Big6Math.div(longNumerator, longDenominator))

  const shortNumerator = Big6Math.add(collateral, notional)
  const shortDenominator = Big6Math.mul(position, Big6Math.add(marketSnapshot.riskParameter.maintenance, Big6Math.ONE))
  const short = Big6Math.abs(Big6Math.div(shortNumerator, shortDenominator))

  return { long, short }
}

export const positionStatus = (position: bigint, nextPosition: bigint, collateral: bigint) => {
  if (Big6Math.isZero(nextPosition) && !Big6Math.isZero(position)) {
    return PositionStatus.closing
  }
  if (Big6Math.isZero(nextPosition) && Big6Math.isZero(position) && !Big6Math.isZero(collateral)) {
    return PositionStatus.closed
  }
  if (!Big6Math.isZero(nextPosition) && Big6Math.isZero(position)) {
    return PositionStatus.opening
  }
  if (!Big6Math.isZero(nextPosition) && !Big6Math.isZero(position) && !Big6Math.eq(nextPosition, position)) {
    return PositionStatus.pricing
  }
  if (!Big6Math.isZero(nextPosition) && !Big6Math.isZero(position)) {
    return PositionStatus.open
  }
  return PositionStatus.resolved
}

export const calcLeverage = (price: bigint, position: bigint, collateral: bigint) => {
  if (Big6Math.isZero(collateral)) return 0n
  return Big6Math.div(calcNotional(position, price), collateral)
}

export const calcExposure = (userPosition: bigint, globalPosition: Position) => {
  if (Big6Math.isZero(globalPosition.maker)) return Big6Math.ZERO

  return Big6Math.div(Big6Math.mul(userPosition, globalPosition.taker), globalPosition.maker)
}

export const calcMakerExposure = (userMaker: bigint, globalMaker: bigint, globalLong: bigint, globalShort: bigint) => {
  if (globalMaker === 0n) return 0n

  return Big6Math.div(Big6Math.mul(userMaker, globalShort - globalLong), globalMaker)
}

export const getStatusDetails = ({
  userMarketSnapshot,
  liquidated,
  isMaker,
}: {
  userMarketSnapshot?: UserMarketSnapshot
  liquidated?: boolean
  isMaker?: boolean
}) => {
  const noValue = {
    isOpenPosition: false,
    isTransitionPosition: false,
    statusColor: 'darkGray',
    status: PositionStatus.resolved,
    directionTextColor: 'darkGray',
    isClosing: false,
    hasPosition: false,
  }
  if (!userMarketSnapshot || !isActivePosition(userMarketSnapshot)) return noValue

  if (
    isMaker &&
    !(userMarketSnapshot.side === PositionSide2.maker || userMarketSnapshot.nextSide === PositionSide2.maker)
  )
    return noValue

  if (
    !isMaker &&
    (userMarketSnapshot.side === PositionSide2.maker || userMarketSnapshot.nextSide === PositionSide2.maker)
  )
    return noValue

  const { status, side, nextSide } = userMarketSnapshot
  const isOpenPosition = [
    PositionStatus.open,
    PositionStatus.pricing,
    PositionStatus.closing,
    PositionStatus.opening,
  ].includes(status)
  const isTransitionPosition = [PositionStatus.pricing, PositionStatus.opening, PositionStatus.closing].includes(status)
  const hasPosition = PositionStatus.resolved !== status
  const isClosing = status === PositionStatus.closing
  let statusColor = isOpenPosition ? (isTransitionPosition ? 'goldenRod' : colors.brand.green) : 'darkGray'
  if (liquidated || status === PositionStatus.failed) {
    statusColor = colors.brand.red
  }
  const directionTextColor =
    side === PositionSide2.none
      ? 'darkGray'
      : [side, nextSide].includes(PositionSide2.long) || side === PositionSide2.maker
      ? colors.brand.green
      : colors.brand.red

  return { isOpenPosition, isTransitionPosition, statusColor, status, directionTextColor, hasPosition, isClosing }
}

export const closedOrResolved = (status?: PositionStatus) =>
  status && [PositionStatus.closed, PositionStatus.resolved].includes(status)

export const getTradeLimitations = (userProductSnapshot?: UserProductSnapshot) => {
  if (!userProductSnapshot) {
    return {
      canOpenTaker: true,
      canOpenMaker: true,
    }
  }
  const { pre, position } = userProductSnapshot
  const nextPosition = next(pre, position)
  const canOpenMaker = nextPosition.taker === 0n
  const canOpenTaker = nextPosition.maker === 0n

  return {
    canOpenTaker,
    canOpenMaker,
  }
}

export const calcNotional = (position: bigint, price: bigint) => {
  return Big6Math.abs(Big6Math.mul(position, price))
}

export const calcTradeFeeApr = ({
  fees7Day,
  makerOi,
  collateral,
  notional,
}: {
  fees7Day: bigint
  makerOi: bigint
  collateral: bigint
  notional: bigint
}) => {
  if (!fees7Day || !makerOi || !collateral || !notional) return 0n
  const dailyAvgFee = Big6Math.div(fees7Day, Big6Math.fromDecimals(7n, 0))
  const annualFees = Big6Math.mul(dailyAvgFee, Big6Math.fromDecimals(365n, 0))
  const annualFeesPerUser = Big6Math.mul(annualFees, notional)
  const denominator = Big6Math.mul(makerOi, collateral)
  return Big6Math.div(annualFeesPerUser, denominator)
}

export const getMakerStats = ({
  product,
  leverage,
  userPosition,
  collateral,
  snapshot,
  fees7Day,
  positionDelta,
}: {
  product?: ProductSnapshot
  leverage?: bigint
  userPosition?: bigint
  collateral?: bigint
  snapshot?: ProductSnapshotWithTradeLimitations
  fees7Day?: bigint
  positionDelta?: bigint
}) => {
  if (
    !product ||
    !snapshot ||
    leverage === undefined ||
    userPosition === undefined ||
    collateral == undefined ||
    fees7Day === undefined
  ) {
    return undefined
  }

  const {
    productInfo: { utilizationCurve },
    latestVersion: { price },
    pre: globalPre,
    position,
  } = product

  const globalPosition = {
    taker: position.taker,
    maker: position.maker + (positionDelta ? positionDelta : 0n),
  }
  const currentUtilization = utilization(globalPre, globalPosition)
  const fundingRate = computeInterestRate(utilizationCurve, currentUtilization)
  const exposure = Big6Math.mul(currentUtilization, leverage)
  const notional = calcNotional(userPosition, price)
  const makerOi = snapshot?.openInterest?.maker ?? 0n

  const fundingFeeAPR = Big6Math.mul(fundingRate, exposure)
  const tradingFeeAPR = calcTradeFeeApr({ fees7Day, makerOi, collateral, notional })
  const totalAPR = tradingFeeAPR + fundingFeeAPR

  return { fundingFeeAPR, tradingFeeAPR, totalAPR, exposure }
}

export const calcMakerStats2 = ({
  funding,
  interest,
  positionFee,
  positionSize,
  collateral,
}: {
  funding: bigint
  interest: bigint
  positionFee: bigint
  positionSize: bigint
  collateral: bigint
}) => {
  if (collateral === 0n) return { fundingAPR: 0n, interestAPR: 0n, positionFeeAPR: 0n }
  const fundingAccumulated = Big6Math.mul(funding, positionSize)
  const interestAccumulated = Big6Math.mul(interest, positionSize)
  const positionFeeAccumulated = Big6Math.mul(positionFee, positionSize)

  return {
    fundingAPR: Big6Math.div(fundingAccumulated * 52n, collateral),
    interestAPR: Big6Math.div(interestAccumulated * 52n, collateral),
    positionFeeAPR: Big6Math.div(positionFeeAccumulated * 52n, collateral),
  }
}

export const getPositionFromSelectedMarket = ({
  isMaker,
  userMarketSnapshots,
  selectedMarket,
  selectedMakerMarket,
}: {
  isMaker?: boolean
  userMarketSnapshots?: MarketSnapshots['user']
  selectedMarket: SupportedAsset
  selectedMakerMarket: SupportedAsset
}) => {
  if (!userMarketSnapshots) return undefined
  if (isMaker) {
    // TODO: we need to check also if the user has collateral
    const userMarketSnapshot = userMarketSnapshots[selectedMakerMarket]
    return [userMarketSnapshot.side, userMarketSnapshot.nextSide].includes(PositionSide2.maker)
      ? userMarketSnapshot
      : undefined
  }
  const userMarketSnapshot = userMarketSnapshots[selectedMarket]
  return [PositionSide2.long, PositionSide2.short].includes(userMarketSnapshot.side) ||
    [PositionSide2.long, PositionSide2.short].includes(userMarketSnapshot.nextSide)
    ? userMarketSnapshot
    : undefined
}

export function getSideFromPosition(position?: UserMarketSnapshot['position']) {
  if (!position) return PositionSide2.none
  return position.maker > 0n
    ? PositionSide2.maker
    : position.long > 0n
    ? PositionSide2.long
    : position.short > 0n
    ? PositionSide2.short
    : PositionSide2.none
}

export function getStatusForSnapshot(
  magnitude: bigint,
  nextMagnitude: bigint,
  collateral: bigint,
  hasVersionError: boolean,
): PositionStatus {
  if (hasVersionError && magnitude !== nextMagnitude) return PositionStatus.failed
  if (Big6Math.isZero(magnitude) && !Big6Math.isZero(nextMagnitude)) return PositionStatus.opening
  if (!Big6Math.isZero(magnitude) && Big6Math.eq(magnitude, nextMagnitude)) return PositionStatus.open
  if (!Big6Math.isZero(magnitude) && Big6Math.isZero(nextMagnitude)) return PositionStatus.closing
  if (!Big6Math.isZero(magnitude) && !Big6Math.eq(magnitude, nextMagnitude)) return PositionStatus.pricing
  if (Big18Math.isZero(magnitude) && Big18Math.isZero(nextMagnitude) && !Big18Math.isZero(collateral))
    return PositionStatus.closed
  return PositionStatus.resolved
}

export function calcTakerLiquidity(marketSnapshot: MarketSnapshot) {
  const {
    nextPosition: { long, short, maker },
  } = marketSnapshot
  const availableLongLiquidity = Big6Math.sub(Big6Math.add(short, maker), long)
  const totalLongLiquidity = Big6Math.add(short, maker)
  const availableShortLiquidity = Big6Math.sub(Big6Math.add(long, maker), short)
  const totalShortLiquidity = Big6Math.add(long, maker)

  return {
    availableLongLiquidity,
    totalLongLiquidity,
    availableShortLiquidity,
    totalShortLiquidity,
  }
}

export function calcLpUtilization(marketSnapshot?: MarketSnapshot) {
  if (!marketSnapshot) return undefined
  const {
    majorSide,
    minorSide,
    nextPosition: { long, short, maker },
  } = marketSnapshot

  const majorPosition = majorSide === PositionSide2.long ? long : short
  const minorPosition = majorSide === PositionSide2.long ? short : long

  const lpUtilization = maker > 0n ? Big6Math.div(Big6Math.sub(majorPosition, minorPosition), maker) : 0n

  return {
    lpUtilization,
    formattedLpUtilization: formatBig6Percent(lpUtilization, { numDecimals: 2 }),
    exposureSide: minorSide,
  }
}

export const isActivePosition = (userMarketSnapshot?: UserMarketSnapshot) => {
  return userMarketSnapshot?.status !== PositionStatus.resolved
}

export const calcSkew = (marketSnapshot?: MarketSnapshot) => {
  if (!marketSnapshot) return undefined
  const {
    nextPosition: { long, short },
    riskParameter: { virtualTaker },
  } = marketSnapshot
  const nextMajor = long > short ? long : short
  const skew =
    nextMajor + virtualTaker > 0n ? Big6Math.div(Big6Math.sub(long, short), Big6Math.add(nextMajor, virtualTaker)) : 0n

  const totalTaker = long + short
  const longSkew = totalTaker > 0n ? Big6Math.div(long, totalTaker) : 0n
  const shortSkew = totalTaker > 0n ? Big6Math.div(short, totalTaker) : 0n
  return {
    skew,
    longSkew,
    shortSkew,
  }
}

export const calcFundingRates = (fundingRate: bigint = 0n) => {
  const rate = Big6Math.div(fundingRate, Year)
  const hourlyFunding = Big6Math.mul(rate, Hour)
  const eightHourFunding = Big6Math.mul(rate, Hour * 8n)
  const dailyFunding = Big6Math.mul(rate, Day)
  return {
    hourlyFunding,
    eightHourFunding,
    dailyFunding,
    yearlyFunding: fundingRate,
  }
}

export const calcTradeFee = ({
  positionDelta,
  marketSnapshot,
  isMaker,
  direction,
}: {
  positionDelta: bigint
  marketSnapshot?: MarketSnapshot
  isMaker: boolean
  direction: PositionSide2
}) => {
  const noValue = { total: 0n, impactFee: 0n, skewFee: 0n, feeBasisPoints: 0n }
  if (!marketSnapshot || !positionDelta) return noValue

  const {
    riskParameter: { takerFee, takerSkewFee, takerImpactFee, makerFee, makerImpactFee, virtualTaker },
    nextPosition: { long, short, maker },
    global: { latestPrice },
  } = marketSnapshot

  const notional = calcNotional(positionDelta, latestPrice)

  if (isMaker) {
    const major = Big6Math.max(long, short)
    const minor = Big6Math.min(long, short)
    const utilizationDenominator = Big6Math.add(major, minor)
    const currentUtilization = utilizationDenominator !== 0n ? Big6Math.div(major, utilizationDenominator) : 0n
    const newUtilization =
      maker + minor + positionDelta !== 0n ? Big6Math.div(major, maker + minor + positionDelta) : 0n
    const utilizationDelta = newUtilization - currentUtilization
    const impactFee = Big6Math.mul(makerImpactFee, utilizationDelta)
    const total = Big6Math.max(Big6Math.mul(notional, impactFee + makerFee), 0n)
    const feeBasisPoints = !Big6Math.isZero(total) ? Big6Math.div(total, notional) : makerFee

    return { impactFee, total, skewFee: undefined, feeBasisPoints }
  }

  const adjustedLong = direction === PositionSide2.long ? long + positionDelta : long
  const adjustedShort = direction === PositionSide2.short ? short + positionDelta : short
  const major = Big6Math.max(adjustedLong, adjustedShort)
  const calculatedSkew = calcSkew(marketSnapshot)
  const currentSkew = calculatedSkew?.skew ?? 0n
  const skewDenominator = Big6Math.add(major, virtualTaker)
  const newSkew = skewDenominator !== 0n ? Big6Math.div(adjustedLong - adjustedShort, skewDenominator) : 0n
  const skewDelta = Big6Math.abs(newSkew - currentSkew)
  const absSkewDelta = Big6Math.abs(newSkew) - Big6Math.abs(currentSkew)
  const skewFee = Big6Math.mul(takerSkewFee, skewDelta)
  const impactFee = Big6Math.mul(takerImpactFee, absSkewDelta)
  const total = Big6Math.max(Big6Math.mul(notional, skewFee + impactFee + takerFee), 0n)
  const feeBasisPoints = !Big6Math.isZero(total) ? Big6Math.div(total, notional) : takerFee

  return { skewFee, impactFee, total, feeBasisPoints }
}

export function calcPriceImpactFromTradeFee({
  totalTradeFee,
  positionFee,
}: {
  totalTradeFee: bigint
  positionFee: bigint
}) {
  return Big6Math.mul(totalTradeFee, Big6Math.ONE - positionFee)
}

export function calcEstExecutionPrice({
  oraclePrice,
  calculatedFee,
  positionFee,
  orderDirection,
  positionDelta,
}: {
  positionDelta: bigint
  oraclePrice: bigint
  calculatedFee: bigint
  positionFee: bigint // marketSnapshot.parameter.positionFee
  orderDirection: PositionSide2.long | PositionSide2.short
}) {
  const notional = calcNotional(positionDelta, oraclePrice)
  const priceImpact = calcPriceImpactFromTradeFee({ totalTradeFee: calculatedFee, positionFee })
  const priceImpactPercentage = notional > 0n ? Big6Math.div(priceImpact, calcNotional(positionDelta, oraclePrice)) : 0n
  const fee = Big6Math.div(priceImpact, positionDelta)

  return {
    priceImpact: fee,
    total: orderDirection === PositionSide2.long ? oraclePrice + fee : oraclePrice - fee,
    priceImpactPercentage,
    nonPriceImpactFee: calculatedFee - priceImpact,
  }
}

export function calcInterfaceFee({
  positionStatus = PositionStatus.resolved,
  latestPrice,
  chainId,
  positionDelta,
  side,
}: {
  positionStatus?: PositionStatus
  latestPrice: bigint
  chainId: SupportedChainId
  positionDelta: bigint
  side: PositionSide2
}) {
  const feeInfo = interfaceFeeBps[chainId]
  if (!latestPrice || !positionDelta || !feeInfo || positionStatus === PositionStatus.failed) {
    return {
      interfaceFeeBps: feeInfo?.feeAmount[PositionSide2.none] ?? 0n,
      interfaceFee: 0n,
    }
  }

  const notional = calcNotional(positionDelta, latestPrice)
  const interfaceFee = Big6Math.mul(notional, feeInfo.feeAmount[side])

  return {
    interfaceFeeBps: feeInfo.feeAmount[side],
    interfaceFee,
  }
}

// Returns the tradeFee + interfaceFee + settlementFee
export function calcTotalPositionChangeFee({
  positionStatus = PositionStatus.resolved,
  chainId,
  marketSnapshot,
  positionDelta,
  direction,
}: {
  chainId: SupportedChainId
  positionDelta: bigint
  marketSnapshot?: MarketSnapshot
  direction: PositionSide2
  positionStatus?: PositionStatus
}) {
  const tradeFee = calcTradeFee({
    positionDelta,
    marketSnapshot,
    isMaker: direction === PositionSide2.maker,
    direction,
  })
  const interfaceFee = calcInterfaceFee({
    positionStatus,
    latestPrice: marketSnapshot?.global.latestPrice ?? 0n,
    chainId,
    positionDelta,
    side: direction,
  })

  const settlementFee = positionDelta !== 0n && marketSnapshot ? marketSnapshot.parameter.settlementFee : 0n

  return {
    total: tradeFee.total + interfaceFee.interfaceFee + settlementFee,
    tradeFee,
    interfaceFee,
    settlementFee,
  }
}

export const getOrderValuesFromPosition = ({
  userMarketSnapshot,
  marketSnapshot,
}: {
  userMarketSnapshot?: UserMarketSnapshot
  marketSnapshot?: MarketSnapshot
}) => {
  if (!marketSnapshot || !userMarketSnapshot) return undefined

  const nextAmount = userMarketSnapshot?.nextMagnitude ?? 0n
  const orderValues = {
    collateral: Big6Math.toFloatString(userMarketSnapshot?.local.collateral ?? 0n),
    amount: Big6Math.toFloatString(nextAmount),
    leverage: Big6Math.toFloatString(userMarketSnapshot?.nextLeverage ?? 0n),
  } as OrderValues

  const positionDelta = userMarketSnapshot.nextMagnitude - userMarketSnapshot.magnitude

  return {
    market: marketSnapshot as MarketSnapshot,
    position: userMarketSnapshot as UserMarketSnapshot,
    asset: marketSnapshot.asset,
    positionSide: userMarketSnapshot.nextSide,
    orderValues,
    positionDelta,
  }
}

export const isFailedClose = (position?: UserMarketSnapshot) => {
  if (!position) return false
  return (
    position.status === PositionStatus.failed &&
    !Big6Math.isZero(position.magnitude) &&
    Big6Math.isZero(position.nextMagnitude)
  )
}
