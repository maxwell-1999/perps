import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Big18Math } from '@/utils/big18Utils'

import { TradeFormValues } from '../hooks'

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
  }
}

export function useCollateralValidators({
  usdcBalance,
  requiredMaintenance,
  minCollateral,
}: {
  usdcBalance: bigint
  requiredMaintenance: bigint
  minCollateral: bigint
}) {
  const copy = useErrorMessages()

  const maxValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      const balance = Big18Math.fromDecimals(usdcBalance, 6)
      if (inputValue > balance) {
        return copy.insufficientFunds
      }
      return true
    }
  }, [usdcBalance, copy.insufficientFunds])

  const minValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      if (inputValue < requiredMaintenance) {
        return copy.belowMaintenance
      }
      if (inputValue < minCollateral) {
        return copy.belowMinCollateral
      }
      return true
    }
  }, [minCollateral, requiredMaintenance, copy.belowMaintenance, copy.belowMinCollateral])

  return {
    max: maxValidator,
    min: minValidator,
  }
}

export function usePositionValidators({ liquidity }: { liquidity: bigint }) {
  const copy = useErrorMessages()

  const maxValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      if (inputValue > liquidity) {
        return copy.insufficientLiquidity
      }
      return true
    }
  }, [liquidity, copy.insufficientLiquidity])

  return {
    max: maxValidator,
  }
}

export function useLeverageValidators({ maxLeverage }: { maxLeverage: number }) {
  const copy = useErrorMessages()

  const maxValidator = useMemo(() => {
    return (value: number) => {
      if (value > maxLeverage) {
        return copy.maxLeverage
      }
      return true
    }
  }, [maxLeverage, copy.maxLeverage])

  return {
    max: maxValidator,
  }
}

export function useCloseAmountValidator({ quantity }: { quantity: bigint }) {
  const copy = useErrorMessages()

  const maxValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big18Math.fromFloatString(value)
      if (inputValue > quantity) {
        return copy.insufficientPosition
      }
      return true
    }
  }, [quantity, copy.insufficientPosition])

  return { max: maxValidator }
}

export function useCloseCollateralValidator({
  currentCollateral,
  minCollateral,
  nextPosition,
}: {
  currentCollateral: bigint
  minCollateral: bigint
  nextPosition: bigint
}) {
  const copy = useErrorMessages()

  const maxValidator = useMemo(() => {
    return (value: string, formValues: TradeFormValues) => {
      const inputValue = Big18Math.fromFloatString(value)
      const fullClose = Big18Math.eq(Big18Math.fromFloatString(formValues.amount), nextPosition ?? 0n)
      if (!fullClose && inputValue > currentCollateral) {
        return copy.insufficientCollateral
      }
      const remainingCollateral = Big18Math.sub(currentCollateral, inputValue)
      if (!fullClose && !Big18Math.isZero(remainingCollateral) && remainingCollateral < minCollateral) {
        return copy.belowMinCollateral
      }
      return true
    }
  }, [minCollateral, currentCollateral, nextPosition, copy.insufficientCollateral, copy.belowMinCollateral])

  return { max: maxValidator }
}
