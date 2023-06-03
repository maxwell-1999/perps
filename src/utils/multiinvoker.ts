import { AbiCoder } from 'ethers'

import { IMultiInvoker } from '@t/generated/MultiInvokerAbi'

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
    userAddress?: string
    productAddress?: string
    position?: bigint
    amount?: bigint
    programs?: number[]
    vaultAddress?: string
    vaultAmount?: bigint
  },
): IMultiInvoker.InvocationStruct => {
  const abiCoder = new AbiCoder()
  switch (action) {
    case InvokerAction.DEPOSIT:
      return {
        action: 1,
        args: abiCoder.encode(['address', 'address', 'uint'], [userAddress, productAddress, amount]),
      }
    case InvokerAction.WITHDRAW:
      return {
        action: 2,
        args: abiCoder.encode(['address', 'address', 'uint'], [userAddress, productAddress, amount]),
      }
    case InvokerAction.OPEN_TAKE:
      return {
        action: 3,
        args: abiCoder.encode(['address', 'uint'], [productAddress, position]),
      }
    case InvokerAction.CLOSE_TAKE:
      return {
        action: 4,
        args: abiCoder.encode(['address', 'uint'], [productAddress, position]),
      }
    case InvokerAction.OPEN_MAKE:
      return {
        action: 5,
        args: abiCoder.encode(['address', 'uint'], [productAddress, position]),
      }
    case InvokerAction.CLOSE_MAKE:
      return {
        action: 6,
        args: abiCoder.encode(['address', 'uint'], [productAddress, position]),
      }
    case InvokerAction.CLAIM:
      return {
        action: 7,
        args: abiCoder.encode(['address', 'uint[]'], [productAddress, programs]),
      }
    case InvokerAction.WRAP:
      return {
        action: 8,
        args: abiCoder.encode(['address', 'uint'], [userAddress, amount]),
      }
    case InvokerAction.UNWRAP:
      return {
        action: 9,
        args: abiCoder.encode(['address', 'uint'], [userAddress, amount]),
      }
    case InvokerAction.WRAP_AND_DEPOSIT:
      return {
        action: 10,
        args: abiCoder.encode(['address', 'address', 'uint'], [userAddress, productAddress, amount]),
      }
    case InvokerAction.WITHDRAW_AND_UNWRAP:
      return {
        action: 11,
        args: abiCoder.encode(['address', 'address', 'uint'], [userAddress, productAddress, amount]),
      }
    case InvokerAction.VAULT_DEPOSIT:
      return {
        action: 12,
        args: abiCoder.encode(['address', 'address', 'uint'], [userAddress, vaultAddress, vaultAmount]),
      }
    case InvokerAction.VAULT_REDEEM:
      return {
        action: 13,
        args: abiCoder.encode(['address', 'uint'], [vaultAddress, vaultAmount]),
      }
    case InvokerAction.VAULT_CLAIM:
      return {
        action: 14,
        args: abiCoder.encode(['address', 'address'], [userAddress, vaultAddress]),
      }
    case InvokerAction.VAULT_WRAP_AND_DEPOSIT:
      return {
        action: 15,
        args: abiCoder.encode(['address', 'address', 'uint'], [userAddress, vaultAddress, vaultAmount]),
      }
    default:
      return { action: 0, args: '0x' }
  }
}
