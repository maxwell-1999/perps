import { Address, encodeAbiParameters } from 'viem'

import { PositionSide2 } from '@/constants/markets'

import { MultiInvoker2Action } from '@t/perennial'

import { UpdateNoOp } from './positionUtils'

export const buildNoop = (): MultiInvoker2Action => ({
  action: 0,
  args: '0x',
})

export const buildUpdateMarket = ({
  market,
  maker,
  long,
  short,
  collateral,
  wrap,
}: {
  market: Address
  maker?: bigint
  long?: bigint
  short?: bigint
  collateral?: bigint
  wrap?: boolean
}): MultiInvoker2Action => ({
  action: 1,
  args: encodeAbiParameters(
    [
      { type: 'address' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'int256' },
      { type: 'bool' },
    ],
    [market, maker ?? UpdateNoOp, long ?? UpdateNoOp, short ?? UpdateNoOp, collateral ?? 0n, !!wrap],
  ),
})

export const buildUpdateVault = ({
  vault,
  deposit,
  redeem,
  claim,
  wrap,
}: {
  vault: Address
  deposit?: bigint
  redeem?: bigint
  claim?: bigint
  wrap?: boolean
}): MultiInvoker2Action => ({
  action: 2,
  args: encodeAbiParameters(
    ['address', 'uint256', 'uint256', 'uint256', 'bool'].map((type) => ({ type })),
    [vault, deposit ?? 0n, redeem ?? 0n, claim ?? 0n, wrap],
  ),
})

const PlaceTriggerOrderInputs = [
  {
    internalType: 'IMarket',
    name: 'market',
    type: 'address',
  },
  {
    type: 'tuple',
    components: [
      {
        internalType: 'uint8',
        name: 'side',
        type: 'uint8',
      },
      {
        internalType: 'int8',
        name: 'comparison',
        type: 'int8',
      },
      {
        internalType: 'UFixed6',
        name: 'fee',
        type: 'uint256',
      },
      {
        internalType: 'Fixed6',
        name: 'price',
        type: 'int256',
      },
      {
        internalType: 'Fixed6',
        name: 'delta',
        type: 'int256',
      },
    ],
  },
] as const
export const buildPlaceTriggerOrder = ({
  market,
  side,
  comparison,
  maxFee,
  triggerPrice,
  delta,
}: {
  market: Address
  side: PositionSide2.long | PositionSide2.short
  comparison: 'lte' | 'gte'
  maxFee: bigint
  triggerPrice: bigint
  delta: bigint
}): MultiInvoker2Action => ({
  action: 3,
  args: encodeAbiParameters(PlaceTriggerOrderInputs, [
    market,
    {
      side: side === 'long' ? 1 : 2,
      comparison: comparison === 'lte' ? -1 : 1,
      fee: maxFee,
      price: triggerPrice,
      delta,
    },
  ]),
})

export const buildCancelOrder = ({ market, nonce }: { market: Address; nonce: bigint }): MultiInvoker2Action => ({
  action: 4,
  args: encodeAbiParameters(
    ['address', 'uint256'].map((type) => ({ type })),
    [market, nonce],
  ),
})

export const buildCommitPrice = ({
  oracle,
  version,
  value,
  index,
  vaa,
  revertOnFailure,
}: {
  oracle: Address
  version: bigint
  value: bigint
  index: bigint
  vaa: string
  revertOnFailure: boolean
}): MultiInvoker2Action => ({
  action: 6,
  args: encodeAbiParameters(
    ['address', 'uint256', 'uint256', 'uint256', 'bytes', 'bool'].map((type) => ({ type })),
    [oracle, value, index, version, vaa, revertOnFailure],
  ),
})

export const buildLiquidate = ({ market, user }: { market: Address; user: Address }): MultiInvoker2Action => ({
  action: 7,
  args: encodeAbiParameters(
    ['address', 'address'].map((type) => ({ type })),
    [market, user],
  ),
})

export const buildApproveTarget = ({ target }: { target: Address }): MultiInvoker2Action => ({
  action: 8,
  args: encodeAbiParameters(
    ['address'].map((type) => ({ type })),
    [target],
  ),
})

export const buildInterfaceFee = ({ to, amount }: { to: Address; amount: bigint }): MultiInvoker2Action => {
  console.log('buildInterfaceFee', to, amount)

  return {
    action: 9,
    args: encodeAbiParameters(
      ['address', 'uint256'].map((type) => ({ type })),
      [to, amount],
    ),
  }
}
