import { FormNames, OrderValues } from '../../constants'

export const stopLossPercents = ['-10', '-20', '-30', '-50', '-75']
export const takeProfitPercents = ['10', '20', '30', '50', '75']

export type TriggerFormValues = Pick<OrderValues, 'takeProfit' | 'triggerAmount' | 'stopLoss'>

export const getInitialTriggerFormState = (latestPrice: string): TriggerFormValues => ({
  [FormNames.triggerAmount]: '',
  [FormNames.takeProfit]: latestPrice,
  [FormNames.stopLoss]: latestPrice,
})
