export const formIds = {
  collateral: 'collateral-input',
  amount: 'amount-input',
  leverage: 'leverage-input',
  closeAmount: 'close-amount-input',
  receiveInput: 'receive-input',
  withdrawAmount: 'withdraw-amount-input',
}

export const buttonPercentValues = [10, 20, 50, 75, 100]

export enum FormNames {
  collateral = 'collateral',
  amount = 'amount',
  leverage = 'leverage',
  leverageFixed = 'leverageFixed',
  limitPrice = 'limitPrice',
  limitPricePercent = 'limitPricePercent',
  stopLoss = 'stopLoss',
  takeProfit = 'takeProfit',
  triggerAmount = 'triggerAmount',
}

export type OrderValues = {
  collateral: string
  amount: string
  fullClose?: boolean
  crossCollateral?: bigint
  limitPrice?: string
  stopLoss?: string
  takeProfit?: string
  triggerAmount?: string
}

export enum OrderTypes {
  market = 'market',
  limit = 'limit',
  stopLoss = 'stopLoss',
  takeProfit = 'takeProfit',
}

export const orderTypes = [OrderTypes.market, OrderTypes.limit, OrderTypes.stopLoss, OrderTypes.takeProfit]
export const triggerOrderTypes = [OrderTypes.stopLoss, OrderTypes.takeProfit]
