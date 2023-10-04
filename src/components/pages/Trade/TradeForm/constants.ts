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
}

export type OrderValues = {
  collateral: string
  amount: string
  fullClose?: boolean
  crossCollateral?: bigint
}

export enum OrderTypes {
  market = 'market',
  limit = 'limit',
  stopLimit = 'stopLimit',
}

export const orderTypes = [OrderTypes.market, OrderTypes.limit, OrderTypes.stopLimit]
