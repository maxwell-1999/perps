import { parseEther } from 'viem'

import { PositionDetails } from '@/hooks/markets'
import { Big18Math, formatBig18, formatBig18USDPrice } from '@/utils/big18Utils'

import { IPerennialLens } from '@t/generated/LensAbi'

import {
  calcPositionFee,
  formatStringToBigint,
  getCollateralDifference,
  getLeverageDifference,
  getPositionDifference,
  needsApproval,
} from '../../utils'
import { Adjustment } from './constants'

export const getPositionChangeValues = ({ collateral, position, leverage, leverageDifference }: Adjustment) => {
  const newCollateral = parseEther(collateral.newCollateral as `${number}`)
  const prevCollateral = Big18Math.sub(newCollateral, collateral.difference)
  const newPosition = parseEther(position.newPosition as `${number}`)
  const prevPosition = Big18Math.sub(newPosition, position.difference)
  const newLeverage = parseEther(leverage as `${number}`)
  const prevLeverage = Big18Math.sub(newLeverage, leverageDifference)

  return {
    newCollateral: formatBig18USDPrice(newCollateral),
    prevCollateral: formatBig18USDPrice(prevCollateral),
    newLeverage: formatBig18(newLeverage),
    prevLeverage: formatBig18(prevLeverage),
    newPosition: formatBig18(newPosition, { numSigFigs: 6 }),
    prevPosition: formatBig18(prevPosition, { numSigFigs: 6 }),
  }
}

type CreateAdjustmentArgs = {
  orderValues: {
    collateral: string
    amount: string
    leverage: number
  }
  position?: PositionDetails
  product: IPerennialLens.ProductSnapshotStructOutput
  usdcAllowance: bigint
}

export const createAdjustment = ({ orderValues, position, product, usdcAllowance = 0n }: CreateAdjustmentArgs) => {
  const currentCollateral = position?.currentCollateral ?? 0n
  const currentPositionAmount = position?.nextPosition ?? 0n
  const {
    latestVersion: { price },
    productInfo: { takerFee, symbol },
  } = product

  const { amount, collateral, leverage } = orderValues
  const positionAmount = formatStringToBigint(amount)
  const collateralAmount = formatStringToBigint(collateral)

  const collateralDifference = getCollateralDifference(collateralAmount, currentCollateral)
  const positionDifference = getPositionDifference(positionAmount, currentPositionAmount)
  const leverageDifference = getLeverageDifference({
    currentCollateral,
    price,
    currentPositionAmount,
    newCollateralAmount: collateralAmount,
    newPositionAmount: positionAmount,
  })

  const adjustment: Adjustment = {
    collateral: {
      newCollateral: collateral,
      difference: collateralDifference,
      isWithdrawingTotalBalance: Big18Math.isZero(collateralAmount),
      needsApproval: needsApproval({ collateralDifference, usdcAllowance }),
    },
    position: {
      newPosition: amount,
      difference: positionDifference,
      isNewPosition: true,
      isClosingPosition: Big18Math.isZero(positionAmount),
      symbol,
      fee: calcPositionFee(price, positionDifference, takerFee),
    },
    leverage: `${leverage}`,
    leverageDifference,
  }

  return adjustment
}
