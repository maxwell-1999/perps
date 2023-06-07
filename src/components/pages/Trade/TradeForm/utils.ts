import { Big18Math } from '@/utils/big18Utils'

export const calcLeverage = (price: bigint, position: bigint, collateral: bigint) => {
  if (Big18Math.isZero(position) || Big18Math.isZero(collateral)) return 0n
  return Big18Math.div(Big18Math.mul(Big18Math.abs(price), position), collateral)
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
  if (!amount || !currentCollateralAmount || !price) return 0
  if (isNewPosition) return 2

  const formattedAmount = Big18Math.toFloatString(amount)
  const parsedPositionAmount = Big18Math.fromFloatString(formattedAmount)
  if (Big18Math.isZero(currentCollateralAmount)) {
    return parseFloat(Big18Math.toFloatString(0n))
  }

  const leverage = calcLeverage(price, parsedPositionAmount, currentCollateralAmount)
  return parseFloat(Big18Math.toFloatString(leverage))
}

export const max18Decimals = (amount: string) => {
  const [first, decimals] = amount.split('.')
  if (!decimals || decimals.length <= 18) {
    return amount
  }

  return `${first}.${decimals.substring(0, 18)}`
}

export const collateralFromAmountAndLeverage = ({
  amount,
  leverage,
  price,
}: {
  amount: string
  leverage: string
  price: bigint
}) => {
  const parsedLeverage = Big18Math.fromFloatString(leverage)
  if (Big18Math.isZero(parsedLeverage)) return ''

  const parsedPositionAmount = Big18Math.fromFloatString(amount)
  const newCollateral = Big18Math.div(Big18Math.abs(Big18Math.mul(parsedPositionAmount, price)), parsedLeverage)
  return Big18Math.toFloatString(newCollateral)
}

export const leverageFromAmountAndCollateral = ({
  amount,
  collateral,
  price,
}: {
  amount: string
  collateral: string
  price: bigint
}) => {
  const parsedCollateralAmount = Big18Math.fromFloatString(collateral)
  if (Big18Math.isZero(parsedCollateralAmount)) {
    return ''
  }

  const parsedPositionAmount = Big18Math.fromFloatString(amount)
  const newLeverage = calcLeverage(price, parsedPositionAmount, parsedCollateralAmount)
  return Big18Math.toFloatString(newLeverage)
}

export const positionFromCollateralAndLeverage = ({
  collateral,
  leverage,
  price,
}: {
  collateral: string
  leverage: string
  price: bigint
}) => {
  if (Big18Math.isZero(price)) return ''

  const parsedCollateralAmount = Big18Math.fromFloatString(collateral)
  const parsedLeverage = Big18Math.fromFloatString(leverage)
  const newPosition = Big18Math.abs(Big18Math.div(Big18Math.mul(parsedLeverage, parsedCollateralAmount), price))
  return Big18Math.toFloatString(newPosition)
}

export const calcCollateralDifference = (newCollateralAmount: bigint, currentCollateralAmount: bigint): bigint => {
  return Big18Math.sub(newCollateralAmount, currentCollateralAmount)
}

export const calcPositionDifference = (newPositionAmount: bigint, currentPositionAmount: bigint): bigint => {
  return Big18Math.sub(newPositionAmount, currentPositionAmount)
}

export const calcLeverageDifference = ({
  currentCollateral,
  newCollateralAmount,
  price,
  currentPositionAmount,
  newPositionAmount,
}: {
  currentCollateral: bigint
  newCollateralAmount: bigint
  price: bigint
  currentPositionAmount: bigint
  newPositionAmount: bigint
}): bigint => {
  if (!currentCollateral) return 0n

  const prevLev = calcLeverage(price, currentPositionAmount, currentCollateral)
  const newLev = calcLeverage(price, newPositionAmount, newCollateralAmount)
  return Big18Math.sub(newLev, prevLev)
}

export const needsApproval = ({
  collateralDifference,
  usdcAllowance,
}: {
  collateralDifference: bigint
  usdcAllowance: bigint
}) => {
  return Big18Math.fromDecimals(usdcAllowance, 6) < collateralDifference || Big18Math.isZero(usdcAllowance)
}

export const calcPositionFee = (price: bigint, positionDelta: bigint, feeRate: bigint) => {
  return Big18Math.abs(Big18Math.mul(Big18Math.mul(price, positionDelta), feeRate))
}

type InitialInputs = {
  userCollateral?: bigint
  amount?: bigint
  price?: bigint
  isNewPosition: boolean
  isConnected: boolean
}

export const formatInitialInputs = ({ userCollateral, amount, price, isNewPosition, isConnected }: InitialInputs) => {
  if (!userCollateral || !amount || !price || !isConnected)
    return {
      collateral: '',
      amount: '',
      leverage: 1,
    }
  const formattedCollateral = Big18Math.toFloatString(userCollateral)
  const formattedAmount = Big18Math.toFloatString(amount)
  return {
    collateral: formattedCollateral === '0.0' ? '0' : formattedCollateral,
    amount: formattedAmount === '0.0' ? '0' : formattedAmount,
    leverage: calculateInitialLeverage({ isNewPosition, amount, currentCollateralAmount: userCollateral, price }),
  }
}
