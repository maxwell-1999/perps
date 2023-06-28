import { IntlShape } from 'react-intl'

import { SupportedAsset } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'
import { PositionDetails } from '@/hooks/markets'
import { Big18Math, formatBig18USDPrice } from '@/utils/big18Utils'
import { calcLeverage } from '@/utils/positionUtils'

import colors from '@ds/theme/colors'

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
import { ModalCopy } from './hooks'

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

export const getOrderToastProps = ({
  orderDirection,
  variant,
  asset,
  amount,
  adjustment,
  copy,
  intl,
  product,
}: {
  orderDirection: OrderDirection
  variant: 'close' | 'adjust' | 'withdraw'
  asset: SupportedAsset
  amount: string
  adjustment: Adjustment
  copy: ModalCopy
  intl: IntlShape
  product: ProductSnapshot
}) => {
  const formattedAsset = asset.toUpperCase()
  if (variant === 'close') {
    const message = intl.formatMessage({ defaultMessage: 'Your {asset} position is closed' }, { asset: formattedAsset })
    return { title: copy.positionClose, message, action: undefined, actionColor: undefined }
  }
  const { prevPosition, newPosition } = adjustment.position
  const isNewPosition = prevPosition === 0n
  const isLong = orderDirection === OrderDirection.Long

  if (isNewPosition) {
    const price = formatBig18USDPrice(Big18Math.abs(product.latestVersion.price))
    const message = intl.formatMessage(
      { defaultMessage: '{amount} {asset} at {price}' },
      { amount, asset: formattedAsset, price },
    )
    return {
      title: copy.orderPlaced,
      action: isLong ? copy.buy : copy.sell,
      message,
      actionColor: isLong ? colors.brand.green : colors.brand.red,
    }
  }

  const difference = Big18Math.toFloatString(Big18Math.abs(adjustment.position.difference))
  const message = intl.formatMessage({ defaultMessage: '{difference} {asset}' }, { difference, asset: formattedAsset })
  const action = isLong
    ? newPosition < prevPosition
      ? copy.sold
      : copy.bought
    : newPosition < prevPosition
    ? copy.bought
    : copy.sold

  return {
    title: copy.positionChanged,
    action,
    message,
    actionColor: action === copy.bought ? colors.brand.green : colors.brand.red,
  }
}
