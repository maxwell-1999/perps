import { useEffect, useRef } from 'react'
import { formatEther, formatUnits, parseEther } from 'viem'

import { Big18Math, formatBig18 } from '@/utils/big18Utils'

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

  const formattedAmount = formatEther(amount) as `${number}`
  const parsedPositionAmount = parseEther(formattedAmount)
  if (Big18Math.isZero(currentCollateralAmount)) {
    return parseFloat(formatBig18(0n, { numSigFigs: 2, useGrouping: false }))
  }

  const leverage = calcLeverage(price, parsedPositionAmount, currentCollateralAmount)
  return parseFloat(formatBig18(leverage, { numSigFigs: 2, useGrouping: false }))
}

export const max18Decimals = (amount: string) => {
  const [first, decimals] = amount.split('.')
  if (!decimals || decimals.length <= 18) {
    return amount
  }

  return `${first}.${decimals.substring(0, 18)}`
}

const stripCommas = (numberValue: string) => {
  return numberValue.replace(/','/g, '')
}

export const calculateAndUpdateCollateral = ({
  amount,
  leverage,
  price,
}: {
  amount: string
  leverage: string
  price?: bigint
}) => {
  if (!amount || amount === '.' || !leverage || !price) return ''
  const parsedLeverage = parseEther(stripCommas(leverage) as `${number}`)
  if (Big18Math.isZero(parsedLeverage)) return ''

  const parsedPositionAmount = parseEther(amount as `${number}`)
  const newCollateral = Big18Math.div(Big18Math.abs(Big18Math.mul(parsedPositionAmount, price)), parsedLeverage)
  const newFormattedCollateral = formatBig18(newCollateral, { numSigFigs: 18 })
  return newFormattedCollateral
}

export const calculateAndUpdateLeverage = ({
  amount,
  collateral,
  price,
}: {
  amount?: string
  collateral?: string
  price?: bigint
}) => {
  if (!amount || amount === '.' || !collateral || collateral === '.' || !price) {
    return '0'
  }
  const parsedCollateralAmount = parseEther(collateral as `${number}`)
  if (Big18Math.isZero(parsedCollateralAmount)) {
    return '0'
  }

  const parsedPositionAmount = parseEther(amount as `${number}`)
  const newLeverage = calcLeverage(price, parsedPositionAmount, parsedCollateralAmount)
  const formattedLeverage = formatBig18(newLeverage, { numSigFigs: 2 })
  return formattedLeverage
}

export const calculateAndUpdatePosition = ({
  collateral,
  leverage,
  price,
}: {
  collateral: string
  leverage: string | null
  price?: bigint
}) => {
  if (!collateral || collateral === '.' || !leverage || leverage === '.' || !price) return ''
  if (Big18Math.isZero(price)) return ''

  const parsedCollateralAmount = parseEther(collateral as `${number}`)
  const parsedLeverage = parseEther(stripCommas(leverage) as `${number}`)
  const newPosition = Big18Math.abs(Big18Math.div(Big18Math.mul(parsedLeverage, parsedCollateralAmount), price))
  const newFormattedPosition = formatBig18(newPosition, { numSigFigs: 18 })
  return newFormattedPosition
}

export function usePrevious<T>(value: T) {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export const getCollateralDifference = (newCollateralAmount: bigint, currentCollateralAmount: bigint): bigint => {
  return Big18Math.sub(newCollateralAmount, currentCollateralAmount)
}

export const getPositionDifference = (newPositionAmount: bigint, currentPositionAmount: bigint): bigint => {
  return Big18Math.sub(newPositionAmount, currentPositionAmount)
}

export const getLeverageDifference = ({
  currentCollateral,
  newCollateralAmount,
  price,
  currentPositionAmount,
  newPositionAMount,
}: {
  currentCollateral: bigint
  newCollateralAmount: bigint
  price: bigint
  currentPositionAmount: bigint
  newPositionAMount: bigint
}): bigint => {
  if (!currentCollateral) return 0n

  const prevLev = calcLeverage(price, currentPositionAmount, currentCollateral)
  const newLev = calcLeverage(price, newPositionAMount, newCollateralAmount)
  return Big18Math.sub(newLev, prevLev)
}

export const to18Decimals = (amount: bigint, fromDecimals = 6): bigint => {
  return parseEther(formatUnits(amount, fromDecimals) as `${number}`)
}

export const needsApproval = ({
  collateralDifference,
  usdcAllowance,
}: {
  collateralDifference: bigint
  usdcAllowance: bigint
}) => {
  return to18Decimals(usdcAllowance) < collateralDifference || Big18Math.isZero(usdcAllowance)
}

export const calcPositionFee = (price: bigint, positionDelta: bigint, feeRate: bigint) => {
  return Big18Math.abs(Big18Math.mul(Big18Math.mul(price, positionDelta), feeRate))
}

export const formatStringToBigint = (value: string) => {
  if (!value || value === '.') return 0n
  return parseEther(value as `${number}`)
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
  const formattedCollateral = formatEther(userCollateral)
  const formattedAmount = formatEther(amount)
  return {
    collateral: formattedCollateral === '0.0' ? '0' : formattedCollateral,
    amount: formattedAmount === '0.0' ? '0' : formattedAmount,
    leverage: calculateInitialLeverage({ isNewPosition, amount, currentCollateralAmount: userCollateral, price }),
  }
}
