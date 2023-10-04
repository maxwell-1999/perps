import { IntlShape } from 'react-intl'

import { PositionSide2, PositionStatus, SupportedAsset } from '@/constants/markets'
import { SupportedChainId } from '@/constants/network'
import { MarketSnapshot, UserMarketSnapshot } from '@/hooks/markets2'
import { Big6Math, formatBig6USDPrice } from '@/utils/big6Utils'
import { calcInterfaceFee, calcLeverage, calcTradeFee } from '@/utils/positionUtils'

import colors from '@ds/theme/colors'

import { OrderValues } from '../../constants'
import { calcCollateralDifference, calcLeverageDifference, calcPositionDifference, needsApproval } from '../../utils'
import { Adjustment } from './constants'
import { ModalCopy } from './hooks'

type CreateAdjustmentArgs = {
  orderValues: OrderValues
  position?: UserMarketSnapshot
  market: MarketSnapshot
  usdcAllowance: bigint
  chainId: SupportedChainId
  positionSide: PositionSide2
}

export const createAdjustment = ({
  orderValues,
  position,
  market,
  chainId,
  usdcAllowance = 0n,
  positionSide,
}: CreateAdjustmentArgs): Adjustment => {
  const currentCollateral = position?.local.collateral ?? 0n
  const currentPositionAmount = position?.magnitude ?? 0n
  const currentLeverage = position?.[position?.status === PositionStatus.failed ? 'leverage' : 'nextLeverage'] ?? 0n
  const currentMaintenance = position?.maintenance ?? 0n

  const {
    global: { latestPrice: price },
    parameter: { settlementFee: settlementFee_ },
  } = market

  const { amount, collateral, fullClose } = orderValues
  const positionAmount = fullClose ? 0n : Big6Math.fromFloatString(amount)
  const collateralAmount = fullClose ? 0n : Big6Math.fromFloatString(collateral)

  const positionDifference = calcPositionDifference(positionAmount, currentPositionAmount)

  const settlementFee = positionDifference !== 0n ? settlementFee_ : 0n
  const interfaceFee = calcInterfaceFee({
    positionStatus: position?.status,
    latestPrice: market.global.latestPrice,
    chainId,
    positionDelta: positionDifference,
    side: positionSide,
  })
  const tradeFee = calcTradeFee({
    positionDelta: positionDifference,
    marketSnapshot: market,
    direction: positionSide,
    isMaker: positionSide === PositionSide2.maker,
  })
  const totalFees = tradeFee.total + interfaceFee.interfaceFee + settlementFee

  const collateralDifference = calcCollateralDifference(collateralAmount, currentCollateral)
  const leverage = calcLeverage(price, positionAmount, collateralAmount - totalFees)
  const leverageDifference = calcLeverageDifference(leverage, currentLeverage)

  return {
    collateral: {
      prevCollateral: currentCollateral,
      newCollateral: collateralAmount,
      difference: collateralDifference,
    },
    position: {
      prevPosition: currentPositionAmount,
      newPosition: positionAmount,
      difference: positionDifference,
      tradeFee: tradeFee.total,
      interfaceFee: interfaceFee.interfaceFee,
      settlementFee,
    },
    leverage: {
      prevLeverage: currentLeverage,
      newLeverage: leverage,
      difference: leverageDifference,
    },
    needsApproval: needsApproval({ collateralDifference, usdcAllowance, interfaceFee: interfaceFee.interfaceFee }),
    fullClose: !!fullClose,
    // Buffer maintenance by 1.5x to prevent liquidations between settlements
    requiresTwoStep: Big6Math.mul(currentMaintenance, Big6Math.fromFloatString('1.5')) > collateralAmount,
  }
}

export const getOrderToastProps = ({
  positionSide,
  variant,
  asset,
  amount,
  adjustment,
  copy,
  intl,
  market,
  isMaker,
}: {
  positionSide: PositionSide2
  variant: 'close' | 'adjust' | 'withdraw'
  asset: SupportedAsset
  amount: string
  adjustment: Adjustment
  copy: ModalCopy
  intl: IntlShape
  market: MarketSnapshot
  isMaker: boolean
}) => {
  const formattedAsset = asset.toUpperCase()
  if (variant === 'close' && adjustment.fullClose) {
    const message = intl.formatMessage(
      { defaultMessage: 'Your {asset} position is closing' },
      { asset: formattedAsset },
    )
    return { title: copy.positionClose, message, action: undefined, actionColor: undefined }
  }
  const { prevPosition, newPosition } = adjustment.position
  const isNewPosition = prevPosition === 0n
  const isLong = positionSide === PositionSide2.long

  if (isNewPosition) {
    const price = formatBig6USDPrice(Big6Math.abs(market.global.latestPrice))
    const message = intl.formatMessage(
      { defaultMessage: '{amount} {asset} at {price}' },
      { amount, asset: formattedAsset, price },
    )
    return {
      title: copy.orderSent,
      action: isMaker ? copy.make : isLong ? copy.buy : copy.sell,
      message,
      actionColor: isLong || isMaker ? colors.brand.green : colors.brand.red,
    }
  }

  const difference = Big6Math.toFloatString(Big6Math.abs(adjustment.position.difference))

  if (difference === '0') {
    // collateral change
    const { newLeverage, prevLeverage } = adjustment.leverage
    const action = newLeverage > prevLeverage ? copy.increase : copy.decrease
    const message = intl.formatMessage(
      { defaultMessage: 'leverage for {orderDirection} {asset}' },
      {
        orderDirection: isMaker ? copy.make : positionSide,
        asset: formattedAsset,
      },
    )
    return {
      title: copy.modifyCollateral,
      action,
      message,
      actionColor: action === copy.increase ? colors.brand.green : colors.brand.red,
    }
  }

  const message = intl.formatMessage(
    { defaultMessage: '{orderDirection} {asset} {difference}' },
    { difference, asset: formattedAsset, orderDirection: isMaker ? copy.make : positionSide },
  )
  const action = newPosition > prevPosition ? copy.increase : copy.decrease

  return {
    title: copy.orderSent,
    action,
    message,
    actionColor: action === copy.increase ? colors.brand.green : colors.brand.red,
  }
}
