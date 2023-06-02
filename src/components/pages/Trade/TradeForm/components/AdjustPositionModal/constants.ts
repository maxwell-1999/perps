type CollateralDetails = {
  difference: bigint
  currency: 'USDC' | 'DSU'
  isWithdrawingTotalBalance: boolean
  needsApproval: boolean
  requiresManualWrap: boolean
  newCollateral: string
}

type PositionDetails = {
  difference: bigint
  isClosingPosition: boolean
  isNewPosition: boolean
  symbol: string
  newPosition: string
  fee: bigint
}

export type Adjustment = {
  collateral: CollateralDetails
  position: PositionDetails
  adjustmentType: AdjustmentType
  leverage?: string
  leverageDifference: bigint
}

export enum AdjustmentType {
  Adjust,
  Create,
}
