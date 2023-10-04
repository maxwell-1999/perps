export enum VaultFormOption {
  Deposit = 'Deposit',
  Redeem = 'Redeem',
}

export const vaultFormOptions: [VaultFormOption, VaultFormOption] = [VaultFormOption.Deposit, VaultFormOption.Redeem]

export enum FormNames {
  amount = 'amount',
}

export type FormValues = {
  amount: string
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
  approveDSULoading: boolean
  approveDSUCompleted: boolean
  depositLoading: boolean
  depositCompleted: boolean
  redemptionLoading: boolean
  redemptionCompleted: boolean
  claimLoading: boolean
  claimCompleted: boolean
}

export const initialTransactionState: TransactionState = {
  approveUSDCLoading: false,
  approveUSDCCompleted: false,
  approveOperatorLoading: false,
  approveOperatorCompleted: false,
  approveDSULoading: false,
  approveDSUCompleted: false,
  depositLoading: false,
  depositCompleted: false,
  redemptionLoading: false,
  redemptionCompleted: false,
  claimLoading: false,
  claimCompleted: false,
}
