type CollateralDetails = {
  difference: bigint
  isWithdrawingTotalBalance: boolean
  needsApproval: boolean
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
  leverage?: string
  leverageDifference: bigint
}
