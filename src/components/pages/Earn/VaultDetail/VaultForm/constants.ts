export enum VaultFormOption {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
}

export const vaultFormOptions: [VaultFormOption, VaultFormOption] = [VaultFormOption.Deposit, VaultFormOption.Withdraw]

export enum FormNames {
  amount = 'amount',
}

export type FormValues = {
  amount: string
}

export enum RequiredApprovals {
  usdc = 'usdc',
  shares = 'shares',
  dsu = 'dsu',
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
  approveSharesLoading: false,
  approveSharesCompleted: false,
  approveDSULoading: false,
  approveDSUCompleted: false,
  depositLoading: false,
  depositCompleted: false,
  redemptionLoading: false,
  redemptionCompleted: false,
  claimLoading: false,
  claimCompleted: false,
}
