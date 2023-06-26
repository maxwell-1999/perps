export type TxState = {
  loading: boolean
  completed: boolean
}

export type ClaimTxState = {
  approveDSULoading: boolean
  approveDSUCompleted: boolean
  claimLoading: boolean
  claimCompleted: boolean
}

export const initialTransactionState: ClaimTxState = {
  approveDSULoading: false,
  approveDSUCompleted: false,
  claimLoading: false,
  claimCompleted: false,
}
