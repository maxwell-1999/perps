import { SupportedAsset, SupportedMakerMarket } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'
import { FormState } from '@/contexts/tradeFormContext'
import { UserCurrentPositions } from '@/hooks/markets'
import { Big18Math } from '@/utils/big18Utils'
import { getMakerAssetAndDirection } from '@/utils/makerMarketUtils'
import { calcLeverage } from '@/utils/positionUtils'

export const calcMaintenance = (price: bigint, position: bigint, maintenanceRate: bigint) => {
  if (Big18Math.isZero(position)) return 0n
  return Big18Math.mul(Big18Math.mul(Big18Math.abs(price), position), maintenanceRate)
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

  const formattedAmount = Big18Math.toFloatString(amount)
  const parsedPositionAmount = Big18Math.fromFloatString(formattedAmount)
  if (Big18Math.isZero(currentCollateralAmount)) {
    return Big18Math.toFloatString(0n)
  }

  const leverage = calcLeverage(price, parsedPositionAmount, currentCollateralAmount)
  return Big18Math.toFloatString(leverage)
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
    return '0'
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
  return Big18Math.fromDecimals(usdcAllowance, 6) < collateralDifference
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
  if (!isConnected)
    return {
      collateral: '',
      amount: '',
      leverage: '1',
    }
  return {
    collateral: userCollateral ? (userCollateral === 0n ? '0' : Big18Math.toFloatString(userCollateral)) : '',
    amount: amount ? (amount === 0n ? '0' : Big18Math.toFloatString(amount)) : '',
    leverage: calculateInitialLeverage({ isNewPosition, amount, currentCollateralAmount: userCollateral, price }),
  }
}

export const calcMaxLeverage = (maintenance?: bigint) => {
  if (!maintenance) return 10
  const maxLeverageAsFloat = 1 / Big18Math.toUnsafeFloat(maintenance)
  if (maxLeverageAsFloat > 20) {
    return maxLeverageAsFloat / 2
  }
  return maxLeverageAsFloat
}

export const isFullClose = (closeAmount: string, currPosition: bigint) => {
  return Big18Math.eq(Big18Math.fromFloatString(closeAmount), Big18Math.abs(currPosition))
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

export const getPositionFromSelectedMarket = ({
  isMaker,
  positions,
  selectedMarket,
  orderDirection,
  selectedMakerMarket,
}: {
  isMaker?: boolean
  positions?: UserCurrentPositions
  selectedMarket: SupportedAsset
  orderDirection: OrderDirection
  selectedMakerMarket: SupportedMakerMarket
}) => {
  if (isMaker) {
    const { asset, orderDirection } = getMakerAssetAndDirection(selectedMakerMarket)
    return positions?.[asset]?.[orderDirection]
  }
  return positions?.[selectedMarket]?.[orderDirection]
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
  const dailyAvgFee = Big18Math.div(fees7Day, Big18Math.fromDecimals(7n, 0))
  const annualFees = Big18Math.mul(dailyAvgFee, Big18Math.fromDecimals(52n, 0))
  const annualFeesPerUser = Big18Math.mul(annualFees, notional)
  const denominator = Big18Math.mul(makerOi, collateral)

  return Big18Math.div(annualFeesPerUser, denominator)
}
