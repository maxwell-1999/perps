import { IProductAbi } from '@abi/IProduct.abi'
import { LensAbi } from '@abi/Lens.abi'

import { ContractReturnType } from './helpers'

export type Position = ContractReturnType<typeof IProductAbi, 'position'>
export type PrePosition = ContractReturnType<typeof IProductAbi, 'pre', []>
export type JumpRateUtilizationCurve = ContractReturnType<typeof IProductAbi, 'utilizationCurve'>
export type ProtocolSnapshot = ContractReturnType<typeof LensAbi, 'snapshot'>
export type ProductSnapshot = ContractReturnType<typeof LensAbi, 'snapshot', ['0x']>
export type UserProductSnapshot = ContractReturnType<typeof LensAbi, 'snapshot', ['0x', '0x']>
