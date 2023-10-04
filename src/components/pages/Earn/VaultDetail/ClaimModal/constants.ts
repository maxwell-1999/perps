export type TxState = {
  loading: boolean
  completed: boolean
}

export type ClaimTxState = {
  claimLoading: boolean
  claimCompleted: boolean
}

export const initialTransactionState: ClaimTxState = {
  claimLoading: false,
  claimCompleted: false,
}
