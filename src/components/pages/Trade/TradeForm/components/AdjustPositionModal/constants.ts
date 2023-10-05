type CollateralDetails = {
  prevCollateral: bigint
  newCollateral: bigint
  difference: bigint
}

type PositionDetails = {
  prevPosition: bigint
  newPosition: bigint
  difference: bigint
  tradeFee: bigint
  interfaceFee: bigint
  settlementFee: bigint
}

type LeverageDetails = {
  prevLeverage: bigint
  newLeverage: bigint
  difference: bigint
}

export type Adjustment = {
  collateral: CollateralDetails
  position: PositionDetails
  leverage: LeverageDetails
  needsApproval: boolean
  approvalAmount: bigint
  fullClose: boolean
  requiresTwoStep: boolean
}
