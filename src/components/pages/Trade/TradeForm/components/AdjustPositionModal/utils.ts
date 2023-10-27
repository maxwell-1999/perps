import { IntlShape } from 'react-intl'

import { PositionSide2, PositionStatus, SupportedAsset } from '@/constants/markets'
import { SupportedChainId } from '@/constants/network'
import { MarketSnapshot, UserMarketSnapshot } from '@/hooks/markets2'
import { Big6Math, formatBig6USDPrice } from '@/utils/big6Utils'
import { calcInterfaceFee, calcLeverage, calcTradeFee } from '@/utils/positionUtils'

import colors from '@ds/theme/colors'

import { OrderTypes, OrderValues } from '../../constants'
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
  isTrigger: boolean
}

export const createAdjustment = ({
  orderValues,
  position,
  market,
  chainId,
  usdcAllowance = 0n,
  positionSide,
  isTrigger,
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
  const triggerOrderSize = Big6Math.fromFloatString(orderValues?.triggerAmount ?? '0')
  const limitPrice = Big6Math.fromFloatString(orderValues?.limitPrice ?? '0')
  const stopLoss = Big6Math.fromFloatString(orderValues?.stopLoss ?? '0')
  const takeProfit = Big6Math.fromFloatString(orderValues?.takeProfit ?? '0')

  const positionDifference = triggerOrderSize
    ? -triggerOrderSize
    : calcPositionDifference(positionAmount, currentPositionAmount)

  const positionPostTrigger = positionAmount - triggerOrderSize

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
  const leverage = calcLeverage(price, isTrigger ? positionPostTrigger : positionAmount, collateralAmount - totalFees)
  const leverageDifference = calcLeverageDifference(leverage, currentLeverage)
  const approvalInfo = needsApproval({ collateralDifference, usdcAllowance, interfaceFee: interfaceFee.interfaceFee })

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
    triggerOrder: {
      size: triggerOrderSize,
      limitPrice,
      stopLoss,
      takeProfit,
    },
    needsApproval: approvalInfo.needsApproval,
    approvalAmount: approvalInfo.approvalAmount,
    fullClose: !!fullClose,
    // Buffer maintenance by 1.5x to prevent liquidations between settlements
    requiresTwoStep: Big6Math.mul(currentMaintenance, Big6Math.fromFloatString('1.5')) > collateralAmount,
  }
}
// TODO: Rough alerting here, this will need to be re-worked to handle diff order types.
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
  orderType,
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
  orderType?: OrderTypes
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
      action: isMaker
        ? copy.make
        : isLong
        ? copy.buyOrderType(orderType ? `${copy[orderType]} ` : '')
        : copy.sellOrderType(orderType ? `${copy[orderType]} ` : ''),
      message,
      actionColor: isLong || isMaker ? colors.brand.green : colors.brand.red,
    }
  }

  const difference = Big6Math.toFloatString(Big6Math.abs(adjustment.position.difference))

  if (difference === '0') {
    // collateral change
    const { newLeverage, prevLeverage } = adjustment.leverage
    const action =
      newLeverage > prevLeverage
        ? copy.increaseOrderType(orderType ? `${copy[orderType]} ` : '')
        : copy.decreaseOrderType(orderType ? `${copy[orderType]} ` : '')
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
      actionColor:
        action === copy.increaseOrderType(orderType ? `${copy[orderType]} ` : '')
          ? colors.brand.green
          : colors.brand.red,
    }
  }

  const message = intl.formatMessage(
    { defaultMessage: '{orderDirection} {asset} {difference}' },
    { difference, asset: formattedAsset, orderDirection: isMaker ? copy.make : positionSide },
  )
  const action =
    newPosition > prevPosition
      ? copy.increaseOrderType(orderType ? `${copy[orderType]} ` : '')
      : copy.decreaseOrderType(orderType ? `${copy[orderType]} ` : '')

  return {
    title: copy.orderSent,
    action,
    message,
    actionColor:
      action === copy.increaseOrderType(orderType ? `${copy[orderType]} ` : '') ? colors.brand.green : colors.brand.red,
  }
}
