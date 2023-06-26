import { PositionDetails } from '@/hooks/markets'
import { Big18Math } from '@/utils/big18Utils'
import { calcLeverage } from '@/utils/positionUtils'

import { ProductSnapshot } from '@t/perennial'

import { OrderValues } from '../../constants'
import {
  calcCollateralDifference,
  calcLeverageDifference,
  calcPositionDifference,
  calcPositionFee,
  needsApproval,
} from '../../utils'
import { Adjustment } from './constants'

type CreateAdjustmentArgs = {
  orderValues: OrderValues
  position?: PositionDetails
  product: ProductSnapshot
  usdcAllowance: bigint
}

export const createAdjustment = ({
  orderValues,
  position,
  product,
  usdcAllowance = 0n,
}: CreateAdjustmentArgs): Adjustment => {
  const currentCollateral = position?.currentCollateral ?? 0n
  const currentPositionAmount = position?.nextPosition ?? 0n
  const currentLeverage = position?.nextLeverage ?? 0n
  const currentMaintenance = position?.maintenance ?? 0n

  const {
    latestVersion: { price },
    productInfo: { takerFee },
  } = product

  const { amount, collateral, fullClose } = orderValues
  const positionAmount = fullClose ? 0n : Big18Math.fromFloatString(amount)
  const collateralAmount = fullClose ? 0n : Big18Math.fromFloatString(collateral)
  const leverage = calcLeverage(price, positionAmount, collateralAmount)

  const collateralDifference = calcCollateralDifference(collateralAmount, currentCollateral)
  const positionDifference = calcPositionDifference(positionAmount, currentPositionAmount)
  const leverageDifference = calcLeverageDifference({
    currentCollateral,
    price,
    currentPositionAmount,
    newCollateralAmount: collateralAmount,
    newPositionAmount: positionAmount,
  })

  return {
    collateral: {
      prevCollateral: currentCollateral,
      newCollateral: collateralAmount,
      difference: collateralDifference,
      crossCollateral: orderValues.crossCollateral ?? 0n,
    },
    position: {
      prevPosition: currentPositionAmount,
      newPosition: positionAmount,
      difference: positionDifference,
      fee: calcPositionFee(price, positionDifference, takerFee),
    },
    leverage: {
      prevLeverage: currentLeverage,
      newLeverage: leverage,
      difference: leverageDifference,
    },
    needsApproval: needsApproval({ collateralDifference, usdcAllowance }),
    fullClose: !!fullClose,
    requiresTwoStep: currentMaintenance > collateralAmount,
  }
}
