import { OrderDirection } from '@/constants/markets'

import { Adjustment } from './components/AdjustPositionModal/constants'

export const orderDirections: [OrderDirection, OrderDirection] = [OrderDirection.Long, OrderDirection.Short]

export const formIds = {
  collateral: 'collateral-input',
  amount: 'amount-input',
  leverage: 'leverage-input',
  closeAmount: 'close-amount-input',
  receiveInput: 'receive-input',
  withdrawAmount: 'withdraw-amount-input',
}

export const buttonPercentValues = [10, 20, 50, 75, 100]

export type TradeFormState = {
  adjustment: Adjustment | null
  positionAmountStr: string
  collateralAmountStr: string
  collateralHasInput: boolean
  leverage: string
  isLeverageFixed: boolean
  updating: boolean
}
