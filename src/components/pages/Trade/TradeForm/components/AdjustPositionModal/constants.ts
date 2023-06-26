type CollateralDetails = {
  prevCollateral: bigint
  newCollateral: bigint
  difference: bigint
  crossCollateral: bigint
}

type PositionDetails = {
  prevPosition: bigint
  newPosition: bigint
  difference: bigint
  fee: bigint
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
  fullClose: boolean
  requiresTwoStep: boolean
}
