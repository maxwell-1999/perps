import { PositionSide2, PositionStatus } from '@/constants/markets'
import { SupportedChainId } from '@/constants/network'
import { FormState } from '@/contexts/tradeFormContext'
import { MarketSnapshot } from '@/hooks/markets2'
import { Big6Math } from '@/utils/big6Utils'
import { calcLeverage, calcNotional, calcTotalPositionChangeFee } from '@/utils/positionUtils'

export const calcMaintenance = (price: bigint, position: bigint, maintenanceRate: bigint) => {
  if (Big6Math.isZero(position)) return 0n
  return Big6Math.mul(Big6Math.mul(Big6Math.abs(price), position), maintenanceRate)
}

type CalculateInitialLeverage = {
  isNewPosition: boolean
  amount?: bigint
  currentCollateralAmount?: bigint
  price?: bigint
}

export const calculateInitialLeverage = ({
  isNewPosition,
  amount,
  currentCollateralAmount,
  price,
}: CalculateInitialLeverage) => {
  if (!amount || !currentCollateralAmount || !price) return '0'
  if (isNewPosition) return '1'

  const formattedAmount = Big6Math.toFloatString(amount)
  const parsedPositionAmount = Big6Math.fromFloatString(formattedAmount)
  if (Big6Math.isZero(currentCollateralAmount)) {
    return Big6Math.toFloatString(0n)
  }

  const leverage = calcLeverage(price, parsedPositionAmount, currentCollateralAmount)
  return Big6Math.toFloatString(leverage)
}

export const collateralFromAmountAndLeverage = ({
  currentAmount,
  amount,
  leverage,
  marketSnapshot,
  chainId,
  positionStatus,
  direction,
}: {
  currentAmount: bigint
  amount: string
  leverage: string
  marketSnapshot: MarketSnapshot
  chainId: SupportedChainId
  positionStatus: PositionStatus
  direction: PositionSide2
}) => {
  const parsedLeverage = Big6Math.fromFloatString(leverage)
  if (Big6Math.isZero(parsedLeverage)) return ''

  const {
    global: { latestPrice: price },
  } = marketSnapshot

  const parsedPositionAmount = Big6Math.fromFloatString(amount)
  const notional = calcNotional(parsedPositionAmount, price)
  const fees = calcTotalPositionChangeFee({
    positionStatus,
    marketSnapshot,
    chainId,
    positionDelta: parsedPositionAmount - currentAmount,
    direction,
  })
  // Add fees to collateral amount since they increase the collateral required for a given position
  const newCollateral = Big6Math.div(notional, parsedLeverage) + fees.total
  return Big6Math.toFloatString(newCollateral)
}

export const leverageFromAmountAndCollateral = ({
  currentAmount,
  amount,
  collateral,
  marketSnapshot,
  chainId,
  positionStatus,
  direction,
}: {
  currentAmount: bigint
  amount: string
  collateral: string
  marketSnapshot: MarketSnapshot
  chainId: SupportedChainId
  positionStatus: PositionStatus
  direction: PositionSide2
}) => {
  const parsedCollateralAmount = Big6Math.fromFloatString(collateral)
  if (Big6Math.isZero(parsedCollateralAmount)) {
    return '0'
  }

  const {
    global: { latestPrice: price },
  } = marketSnapshot
  const parsedPositionAmount = Big6Math.fromFloatString(amount)
  const fees = calcTotalPositionChangeFee({
    positionStatus,
    marketSnapshot,
    chainId,
    positionDelta: parsedPositionAmount - currentAmount,
    direction,
  })
  const newLeverage = calcLeverage(
    price,
    parsedPositionAmount,
    parsedCollateralAmount > fees.total ? parsedCollateralAmount - fees.total : parsedCollateralAmount,
  )
  return Big6Math.toFloatString(newLeverage)
}

export const positionFromCollateralAndLeverage = ({
  currentAmount,
  collateral,
  leverage,
  marketSnapshot,
  chainId,
  positionStatus,
  direction,
}: {
  currentAmount: bigint
  collateral: string
  leverage: string
  marketSnapshot: MarketSnapshot
  chainId: SupportedChainId
  positionStatus: PositionStatus
  direction: PositionSide2
}) => {
  const {
    global: { latestPrice: price },
  } = marketSnapshot
  if (Big6Math.isZero(price)) return ''

  const parsedCollateralAmount = Big6Math.fromFloatString(collateral)
  const parsedLeverage = Big6Math.fromFloatString(leverage)
  let newPosition = Big6Math.abs(Big6Math.div(Big6Math.mul(parsedLeverage, parsedCollateralAmount), price))

  // Iteratively calculate position size to approach ideal position size for given leverage and fees
  for (let i = 0; i < 10; i++) {
    const fees = calcTotalPositionChangeFee({
      positionStatus,
      marketSnapshot,
      chainId,
      positionDelta: newPosition - currentAmount,
      direction,
    })

    newPosition = Big6Math.abs(Big6Math.div(Big6Math.mul(parsedLeverage, parsedCollateralAmount - fees.total), price))
  }

  return Big6Math.toFloatString(newPosition)
}

export const calcCollateralDifference = (newCollateralAmount: bigint, currentCollateralAmount: bigint): bigint => {
  return Big6Math.sub(newCollateralAmount, currentCollateralAmount)
}

export const calcPositionDifference = (newPositionAmount: bigint, currentPositionAmount: bigint): bigint => {
  return Big6Math.sub(newPositionAmount, currentPositionAmount)
}

export const calcLeverageDifference = (newLeverage: bigint, currentLeverage: bigint): bigint => {
  return Big6Math.sub(newLeverage, currentLeverage)
}

export const needsApproval = ({
  collateralDifference,
  usdcAllowance,
  interfaceFee,
}: {
  collateralDifference: bigint
  usdcAllowance: bigint
  interfaceFee: bigint
}) => {
  const change = collateralDifference + interfaceFee
  const approvalAmount = change < 0n ? interfaceFee : collateralDifference + interfaceFee
  return { needsApproval: Big6Math.fromDecimals(usdcAllowance, 6) < approvalAmount, approvalAmount }
}

export const calcPositionFee = (price: bigint, positionDelta: bigint, feeRate: bigint) => {
  return Big6Math.abs(Big6Math.mul(Big6Math.mul(price, positionDelta), feeRate))
}

type InitialInputs = {
  userCollateral?: bigint
  amount?: bigint
  price?: bigint
  isNewPosition: boolean
  isConnected: boolean
  isFailedClose?: boolean
}

export const formatInitialInputs = ({
  userCollateral,
  amount,
  price,
  isNewPosition,
  isConnected,
  isFailedClose,
}: InitialInputs) => {
  if (!isConnected)
    return {
      collateral: '',
      amount: '',
      leverage: '1',
    }
  return {
    collateral: userCollateral ? (userCollateral === 0n ? '0' : Big6Math.toFloatString(userCollateral)) : '',
    amount: amount ? (amount === 0n ? '0' : Big6Math.toFloatString(amount)) : isFailedClose ? '0' : '',
    leverage: calculateInitialLeverage({ isNewPosition, amount, currentCollateralAmount: userCollateral, price }),
  }
}

/* MaxLeverage is the minimum of the following:
  min(100x, 1/margin, collateral/minCollateralForFullRange * 1/margin)
*/
export const calcMaxLeverage = ({
  margin,
  minMargin,
  collateral,
}: { margin?: bigint; minMargin?: bigint; collateral?: bigint } = {}) => {
  if (!margin) return 10
  const marginMaxLeverage = Big6Math.div(Big6Math.ONE, margin)
  const minCollateralForFullRange = Big6Math.mul(minMargin ?? 0n, marginMaxLeverage)
  const collateralMaxLeverage = !!collateral
    ? Big6Math.div(Big6Math.mul(collateral, marginMaxLeverage), minCollateralForFullRange)
    : marginMaxLeverage

  const maxLeverage = Big6Math.min(marginMaxLeverage, collateralMaxLeverage)

  const flooredLeverage = Math.floor(Big6Math.toUnsafeFloat(Big6Math.min(maxLeverage, Big6Math.ONE * 100n)))
  // Round to nearest 5x
  return flooredLeverage < 5 ? flooredLeverage : Math.floor(flooredLeverage / 5) * 5
}

export const isFullClose = (closeAmount: string, currPosition: bigint) => {
  return Big6Math.eq(Big6Math.fromFloatString(closeAmount), Big6Math.abs(currPosition))
}

export const getContainerVariant = (formState: FormState, isClosedOrResolved: boolean, isLoggedOut: boolean) => {
  if (isClosedOrResolved || isLoggedOut) {
    return 'transparent'
  }
  if (formState === FormState.close) {
    return 'pink'
  }
  return 'active'
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
