export enum RequiredApprovals {
  usdc = 'usdc',
  shares = 'shares',
}

export type TxState = {
  loading: boolean
  completed: boolean
}

export type TransactionState = {
  approveUSDCLoading: boolean
  approveUSDCCompleted: boolean
  approveSharesLoading: boolean
  approveSharesCompleted: boolean
  depositLoading: boolean
  depositCompleted: boolean
  redemptionLoading: boolean
  redemptionCompleted: boolean
}

export const initialTransactionState: TransactionState = {
  approveUSDCLoading: false,
  approveUSDCCompleted: false,
  approveSharesLoading: false,
  approveSharesCompleted: false,
  depositLoading: false,
  depositCompleted: false,
  redemptionLoading: false,
  redemptionCompleted: false,
}
