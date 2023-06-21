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
