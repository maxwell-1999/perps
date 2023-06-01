import { useMemo } from 'react'

import { OpenPositionType } from '@/constants/markets'

import { Adjustment, Callbacks, Steps } from './constants'

const getFullAdjustmentInfo =
  (adjustment: Adjustment, positionType: OpenPositionType, callbacks: Callbacks) => (isLoading: boolean) => {
    const {
      collateral: { difference: collateralDifference, currency, isWithdrawingTotalBalance },
      position: { difference: positionDifference, isNewPosition, isClosingPosition },
    } = adjustment
    const { onModifyPosition } = callbacks
    if (isWithdrawingTotalBalance) {
      return {
        label: `Withdraw Collateral`,
        description: `Withdraw${isLoading ? 'ing' : ''} Collateral`,
        onClick: () => onModifyPosition(currency, collateralDifference, positionType, positionDifference),
      }
    }

    let label = 'Modify Position'
    let description = `Modify${isLoading ? 'ing' : ''} Position`
    if (isNewPosition) {
      label = 'Open Position'
      description = `Open${isLoading ? 'ing' : ''} Position`
    } else if (isClosingPosition) {
      label = 'Close Position'
      description = `Clos${isLoading ? 'ing' : 'e'} Position`
    }

    return {
      label,
      description,
      onClick: () => onModifyPosition(currency, collateralDifference, positionType, positionDifference),
    }
  }

const getApprovalAdjustmentInfo = (adjustment: Adjustment, callbacks: Callbacks) => (isLoading: boolean) => {
  const {
    collateral: { currency },
  } = adjustment
  const { onApproveDSU, onApproveUSDC } = callbacks
  return {
    description: `Approve ${currency}`,
    label: `${isLoading ? 'Approving' : 'Approve'} ${currency} spend`,
    onClick: currency === 'USDC' ? onApproveUSDC : onApproveDSU,
  }
}

export const useSteps = (
  adjustment: Adjustment,
  callbacks: Callbacks,
  currStep: number,
  positionType: OpenPositionType,
  currIsLoading: boolean,
) => {
  return useMemo(() => {
    const stepToLabel = {
      [Steps.Adjustment]: getFullAdjustmentInfo(adjustment, positionType, callbacks),
      [Steps.Approval]: getApprovalAdjustmentInfo(adjustment, callbacks),
    }

    const { collateral } = adjustment
    const steps = [Steps.Adjustment]

    // no need to approve USDC/DSU if user is just withdrawing
    if (collateral.difference > 0n && collateral.needsApproval) {
      steps.unshift(Steps.Approval)
    }

    return steps.map((step, i) => ({
      step,
      ...stepToLabel[step](currStep === i && currIsLoading),
    }))
  }, [adjustment, positionType, currStep, currIsLoading, callbacks])
}
