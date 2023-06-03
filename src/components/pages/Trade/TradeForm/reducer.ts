import { TradeFormState } from './constants'

const initialState: TradeFormState = {
  adjustment: null,
  positionAmountStr: '',
  collateralAmountStr: '',
  collateralHasInput: false,
  leverage: '0',
  isLeverageFixed: false,
  updating: false,
}

export function getInitialReduxState(overrides?: Partial<TradeFormState>): TradeFormState {
  return { ...initialState, ...overrides }
}

export enum ActionTypes {
  SET_ADJUSTMENT,
  SET_POSITION_AMOUNT,
  SET_COLLATERAL_AMOUNT,
  SET_COLLATERAL_HAS_INPUT,
  SET_LEVERAGE,
  SET_IS_LEVERAGE_FIXED,
  SET_UPDATING,
  RESET_FORM,
}

export type Action = { type: ActionTypes; payload?: any }

export function reducer(state: TradeFormState, action: Action) {
  switch (action.type) {
    case ActionTypes.SET_ADJUSTMENT:
      return { ...state, adjustment: action.payload }
    case ActionTypes.SET_POSITION_AMOUNT:
      return { ...state, positionAmountStr: action.payload }
    case ActionTypes.SET_COLLATERAL_AMOUNT:
      return { ...state, collateralAmountStr: action.payload }
    case ActionTypes.SET_COLLATERAL_HAS_INPUT:
      return { ...state, collateralHasInput: action.payload }
    case ActionTypes.SET_LEVERAGE:
      return { ...state, leverage: action.payload }
    case ActionTypes.SET_IS_LEVERAGE_FIXED:
      return { ...state, isLeverageFixed: action.payload }
    case ActionTypes.SET_UPDATING:
      return { ...state, updating: action.payload }
    case ActionTypes.RESET_FORM:
      return { ...initialState, ...action?.payload }
  }
}
