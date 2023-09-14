import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Big18Math } from '@/utils/big18Utils'

import { TradeFormValues } from '../hooks'
import { isFullClose } from '../utils'

function useErrorMessages() {
  const intl = useIntl()
  return {
    insufficientFunds: intl.formatMessage({ defaultMessage: 'Insufficent collateral available.' }),
    belowMaintenance: intl.formatMessage({ defaultMessage: 'Collateral is below maintenance requirement.' }),
    belowMinCollateral: intl.formatMessage({ defaultMessage: 'Collateral is below minimum requirement.' }),
    insufficientLiquidity: intl.formatMessage({ defaultMessage: 'Order size exceeds the available liquidity.' }),
    maxLeverage: intl.formatMessage({ defaultMessage: 'Maximum leverage exceeded.' }),
    insufficientPosition: intl.formatMessage({ defaultMessage: 'Value exceeds position amount.' }),
    insufficientCollateral: intl.formatMessage({ defaultMessage: 'Value exceeds collateral amount.' }),
    requiredField: intl.formatMessage({ defaultMessage: 'This field is required.' }),
    exceedsMakerLimit: intl.formatMessage({ defaultMessage: 'Exceeds total maker limit' }),
    belowMinMaker: intl.formatMessage({ defaultMessage: 'Below minimum maker requirements' }),
  }
}

export const useIsRequiredValidator = () => {
  const copy = useErrorMessages()
  return (value: string) => {
    return value && value.trim() !== '' ? true : copy.requiredField
  }
}

export function useCollateralValidators({
  usdcBalance,
  requiredMaintenance,
  minCollateral,
  currentCollateral,
}: {
  usdcBalance: bigint
  requiredMaintenance: bigint
  minCollateral: bigint
  currentCollateral: bigint
}) {
  const copy = useErrorMessages()
  const isRequiredValidator = useIsRequiredValidator()

  const maxValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      const balance = Big18Math.fromDecimals(usdcBalance, 6)
      if (Big18Math.max(0n, inputValue - currentCollateral) > balance) {
        return copy.insufficientFunds
      }
      return true
    }
  }, [usdcBalance, currentCollateral, copy.insufficientFunds])

  const minValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      if (inputValue < requiredMaintenance) {
        return copy.belowMaintenance
      }
      if (inputValue > 0n && inputValue < minCollateral) {
        return copy.belowMinCollateral
      }
      return true
    }
  }, [minCollateral, requiredMaintenance, copy.belowMaintenance, copy.belowMinCollateral])

  return {
    max: maxValidator,
    min: minValidator,
    required: isRequiredValidator,
  }
}

export function usePositionValidators({
  liquidity,
  isMaker,
  totalMaker,
  totalTaker,
  currentPositionAmount,
  makerLimit,
}: {
  liquidity: bigint
  isMaker: boolean
  totalMaker: bigint
  totalTaker: bigint
  currentPositionAmount: bigint
  makerLimit: bigint
}) {
  const copy = useErrorMessages()
  const isRequiredValidator = useIsRequiredValidator()

  const maxValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      if (inputValue > liquidity) {
        return copy.insufficientLiquidity
      }
      return true
    }
  }, [liquidity, copy.insufficientLiquidity])

  const maxMakerValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      const positionDelta = inputValue - currentPositionAmount
      if (totalMaker + positionDelta > makerLimit) {
        return copy.exceedsMakerLimit
      }
      return true
    }
  }, [makerLimit, copy.exceedsMakerLimit, totalMaker, currentPositionAmount])

  const minMakerValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      const positionDelta = inputValue - currentPositionAmount

      if (totalMaker + positionDelta < totalTaker) {
        if (!(totalTaker > totalMaker && positionDelta > 0n)) {
          return copy.belowMinMaker
        }
      }
      return true
    }
  }, [totalMaker, totalTaker, copy.belowMinMaker, currentPositionAmount])

  return {
    max: isMaker ? maxMakerValidator : maxValidator,
    required: isRequiredValidator,
    ...(isMaker ? { min: minMakerValidator } : {}),
  }
}

export function useLeverageValidators({ maxLeverage }: { maxLeverage: number }) {
  const copy = useErrorMessages()
  const isRequiredValidator = useIsRequiredValidator()

  const maxValidator = useMemo(() => {
    return (value: string) => {
      if (Number(value) > maxLeverage) {
        return copy.maxLeverage
      }
      return true
    }
  }, [maxLeverage, copy.maxLeverage])

  return {
    max: maxValidator,
    required: isRequiredValidator,
  }
}

export function useCloseAmountValidator({
  currentPositionAmount,
  isMaker,
  totalMaker,
  totalTaker,
}: {
  currentPositionAmount: bigint
  isMaker: boolean
  totalMaker: bigint
  totalTaker: bigint
}) {
  const copy = useErrorMessages()
  const isRequiredValidator = useIsRequiredValidator()

  const maxValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      if (inputValue > currentPositionAmount) {
        return copy.insufficientPosition
      }
      return true
    }
  }, [currentPositionAmount, copy.insufficientPosition])

  const maxMakerValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      const positionDelta = -inputValue

      if (inputValue > currentPositionAmount) {
        return copy.insufficientPosition
      }

      if (totalMaker + positionDelta < totalTaker) {
        if (!(totalTaker > totalMaker && positionDelta > 0n)) {
          return copy.belowMinMaker
        }
      }
      return true
    }
  }, [totalMaker, totalTaker, currentPositionAmount, copy.insufficientPosition, copy.belowMinMaker])
  return { max: isMaker ? maxMakerValidator : maxValidator, required: isRequiredValidator }
}

export function useCloseCollateralValidator({
  currentCollateral,
  minCollateral,
  nextPosition,
  requiredMaintenance,
}: {
  currentCollateral: bigint
  minCollateral: bigint
  nextPosition: bigint
  requiredMaintenance: bigint
}) {
  const copy = useErrorMessages()
  const isRequiredValidator = useIsRequiredValidator()

  const maxValidator = useMemo(() => {
    return (value: string, formValues: TradeFormValues) => {
      const inputValue = Big18Math.fromFloatString(value)
      const fullClose = isFullClose(formValues.amount, nextPosition ?? 0n)
      if (!fullClose && inputValue > currentCollateral) {
        return copy.insufficientCollateral
      }
      const remainingCollateral = Big18Math.sub(currentCollateral, inputValue)
      if (!fullClose && !Big18Math.isZero(remainingCollateral) && remainingCollateral < minCollateral) {
        return copy.belowMinCollateral
      }
      if (remainingCollateral < requiredMaintenance) {
        return copy.belowMaintenance
      }
      return true
    }
  }, [
    nextPosition,
    currentCollateral,
    minCollateral,
    requiredMaintenance,
    copy.insufficientCollateral,
    copy.belowMinCollateral,
    copy.belowMaintenance,
  ])

  return { max: maxValidator, required: isRequiredValidator }
}
