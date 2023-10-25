import { useCallback } from 'react'
import { UseFormSetValue } from 'react-hook-form'

import { PositionSide2 } from '@/constants/markets'
import { Big6Math } from '@/utils/big6Utils'
import { isNumbersOnly } from '@/utils/formUtils'

import { FormNames, OrderTypes } from '../../constants'
import { TriggerFormValues } from './constants'

const setArgs = { shouldValidate: true, shouldDirty: true }

export const useTriggerOnChangeHandlers = ({ setValue }: { setValue: UseFormSetValue<TriggerFormValues> }) => {
  const onChangeStopLoss = useCallback(
    (newStopLoss: string) => {
      if (!isNumbersOnly(newStopLoss)) return
      const validatedStopLoss = Big6Math.max6Decimals(newStopLoss)
      setValue(FormNames.stopLoss, validatedStopLoss, setArgs)
    },
    [setValue],
  )

  const onChangeTakeProfit = useCallback(
    (newTakeProfit: string) => {
      if (!isNumbersOnly(newTakeProfit)) return
      const validatedTakeProfit = Big6Math.max6Decimals(newTakeProfit)
      setValue(FormNames.takeProfit, validatedTakeProfit, setArgs)
    },
    [setValue],
  )

  const onChangeTriggerAmount = useCallback(
    (newTriggerAmount: string) => {
      if (!isNumbersOnly(newTriggerAmount)) return
      const validatedTriggerAmount = Big6Math.max6Decimals(newTriggerAmount)
      setValue(FormNames.triggerAmount, validatedTriggerAmount, setArgs)
    },
    [setValue],
  )

  return {
    onChangeStopLoss,
    onChangeTakeProfit,
    onChangeTriggerAmount,
  }
}

export const calcTriggerOrderPrice = ({
  positionSize,
  orderDirection,
  orderType,
  percent,
  latestPrice,
  collateral,
}: {
  positionSize: bigint
  orderDirection: PositionSide2.long | PositionSide2.short
  orderType: OrderTypes
  percent: string
  latestPrice: bigint
  collateral: bigint
}): { triggerPrice: number; valueChange: bigint } => {
  const formattedPercent = (BigInt(percent) * Big6Math.BASE) / 100n
  const valueChange = Big6Math.mul(formattedPercent, collateral)

  const priceChangePerUnit = Big6Math.abs(Big6Math.div(valueChange, positionSize))

  let triggerPriceBigInt: bigint

  if (orderDirection === PositionSide2.long) {
    if (orderType === OrderTypes.stopLoss) {
      triggerPriceBigInt = latestPrice - priceChangePerUnit
    } else {
      triggerPriceBigInt = latestPrice + priceChangePerUnit
    }
  } else {
    if (orderType === OrderTypes.stopLoss) {
      triggerPriceBigInt = latestPrice + priceChangePerUnit
    } else {
      triggerPriceBigInt = latestPrice - priceChangePerUnit
    }
  }
  const triggerPrice = Big6Math.toUnsafeFloat(triggerPriceBigInt)

  return { triggerPrice, valueChange }
}
