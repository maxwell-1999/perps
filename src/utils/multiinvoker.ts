import { Address, Hex, encodeAbiParameters, parseAbiParameters } from 'viem'

export enum InvokerAction {
  NOOP,
  DEPOSIT,
  WITHDRAW,
  OPEN_TAKE,
  CLOSE_TAKE,
  OPEN_MAKE,
  CLOSE_MAKE,
  CLAIM,
  WRAP,
  UNWRAP,
  WRAP_AND_DEPOSIT,
  WITHDRAW_AND_UNWRAP,
  VAULT_DEPOSIT,
  VAULT_REDEEM,
  VAULT_CLAIM,
  VAULT_WRAP_AND_DEPOSIT,
}

export const buildInvokerAction = (
  action: InvokerAction,
  {
    userAddress,
    productAddress,
    position,
    amount,
    programs,
    vaultAddress,
    vaultAmount,
  }: {
    userAddress: Address
    productAddress?: Address
    position?: bigint
    amount?: bigint
    programs?: bigint[]
    vaultAddress?: Address
    vaultAmount?: bigint
  },
): { action: number; args: Hex } => {
  switch (action) {
    case InvokerAction.DEPOSIT:
      if (amount === undefined || productAddress === undefined) throw new Error('Invalid arguments')
      return {
        action: 1,
        args: encodeAbiParameters(parseAbiParameters('address, address, uint'), [userAddress, productAddress, amount]),
      }
    case InvokerAction.WITHDRAW:
      if (amount === undefined || productAddress === undefined) throw new Error('Invalid arguments')
      return {
        action: 2,
        args: encodeAbiParameters(parseAbiParameters(['address, address, uint']), [
          userAddress,
          productAddress,
          amount,
        ]),
      }
    case InvokerAction.OPEN_TAKE:
      if (position === undefined || productAddress === undefined) throw new Error('Invalid arguments')
      return {
        action: 3,
        args: encodeAbiParameters(parseAbiParameters(['address, uint']), [productAddress, position]),
      }
    case InvokerAction.CLOSE_TAKE:
      if (position === undefined || productAddress === undefined) throw new Error('Invalid arguments')
      return {
        action: 4,
        args: encodeAbiParameters(parseAbiParameters(['address, uint']), [productAddress, position]),
      }
    case InvokerAction.OPEN_MAKE:
      if (position === undefined || productAddress === undefined) throw new Error('Invalid arguments')
      return {
        action: 5,
        args: encodeAbiParameters(parseAbiParameters(['address, uint']), [productAddress, position]),
      }
    case InvokerAction.CLOSE_MAKE:
      if (position === undefined || productAddress === undefined) throw new Error('Invalid arguments')
      return {
        action: 6,
        args: encodeAbiParameters(parseAbiParameters(['address, uint']), [productAddress, position]),
      }
    case InvokerAction.CLAIM:
      if (programs === undefined || productAddress === undefined) throw new Error('Invalid arguments')
      return {
        action: 7,
        args: encodeAbiParameters(parseAbiParameters(['address, uint[]']), [productAddress, programs]),
      }
    case InvokerAction.WRAP:
      if (amount === undefined) throw new Error('Invalid arguments')
      return {
        action: 8,
        args: encodeAbiParameters(parseAbiParameters(['address, uint']), [userAddress, amount]),
      }
    case InvokerAction.UNWRAP:
      if (amount === undefined) throw new Error('Invalid arguments')
      return {
        action: 9,
        args: encodeAbiParameters(parseAbiParameters(['address, uint']), [userAddress, amount]),
      }
    case InvokerAction.WRAP_AND_DEPOSIT:
      if (amount === undefined || productAddress === undefined) throw new Error('Invalid arguments')
      return {
        action: 10,
        args: encodeAbiParameters(parseAbiParameters(['address, address, uint']), [
          userAddress,
          productAddress,
          amount,
        ]),
      }
    case InvokerAction.WITHDRAW_AND_UNWRAP:
      if (amount === undefined || productAddress === undefined) throw new Error('Invalid arguments')
      return {
        action: 11,
        args: encodeAbiParameters(parseAbiParameters(['address, address, uint']), [
          userAddress,
          productAddress,
          amount,
        ]),
      }
    case InvokerAction.VAULT_DEPOSIT:
      if (vaultAddress === undefined || vaultAmount === undefined) throw new Error('Invalid arguments')
      return {
        action: 12,
        args: encodeAbiParameters(parseAbiParameters(['address, address, uint']), [
          userAddress,
          vaultAddress,
          vaultAmount,
        ]),
      }
    case InvokerAction.VAULT_REDEEM:
      if (vaultAddress === undefined || vaultAmount === undefined) throw new Error('Invalid arguments')
      return {
        action: 13,
        args: encodeAbiParameters(parseAbiParameters(['address, uint']), [vaultAddress, vaultAmount]),
      }
    case InvokerAction.VAULT_CLAIM:
      if (vaultAddress === undefined) throw new Error('Invalid arguments')
      return {
        action: 14,
        args: encodeAbiParameters(parseAbiParameters(['address, address']), [userAddress, vaultAddress]),
      }
    case InvokerAction.VAULT_WRAP_AND_DEPOSIT:
      if (vaultAddress === undefined || vaultAmount === undefined) throw new Error('Invalid arguments')
      return {
        action: 15,
        args: encodeAbiParameters(parseAbiParameters(['address, address, uint']), [
          userAddress,
          vaultAddress,
          vaultAmount,
        ]),
      }
    default:
      return { action: 0, args: '0x' }
  }
}
