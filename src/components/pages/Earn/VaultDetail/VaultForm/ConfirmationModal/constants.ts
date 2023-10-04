export enum RequiredApprovals {
  usdc = 'usdc',
  operator = 'operator',
}

export type TxState = {
  loading: boolean
  completed: boolean
}

export type TransactionState = {
  approveUSDCLoading: boolean
  approveUSDCCompleted: boolean
  approveOperatorLoading: boolean
  approveOperatorCompleted: boolean
  depositLoading: boolean
  depositCompleted: boolean
  redemptionLoading: boolean
  redemptionCompleted: boolean
}

export const initialTransactionState: TransactionState = {
  approveUSDCLoading: false,
  approveUSDCCompleted: false,
  approveOperatorLoading: false,
  approveOperatorCompleted: false,
  depositLoading: false,
  depositCompleted: false,
  redemptionLoading: false,
  redemptionCompleted: false,
}
