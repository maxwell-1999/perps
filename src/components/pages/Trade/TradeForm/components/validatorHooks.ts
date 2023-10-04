import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Big6Math, formatBig6USDPrice } from '@/utils/big6Utils'
import { efficiency } from '@/utils/positionUtils'

import { TradeFormValues } from '../hooks'
import { isFullClose } from '../utils'

function useErrorMessages() {
  const intl = useIntl()
  return {
    insufficientFunds: intl.formatMessage({ defaultMessage: 'Insufficent collateral available.' }),
    belowReqMaintenance: (price: string) =>
      intl.formatMessage({ defaultMessage: 'Collateral is below maintenance requirement of {price}.' }, { price }),
    belowMinMaintenance: (price: string) =>
      intl.formatMessage(
        { defaultMessage: 'Collateral is below minimum maintenance requirement of {price}' },
        { price },
      ),
    belowMinCollateral: intl.formatMessage({ defaultMessage: 'Collateral is below minimum requirement.' }),
    insufficientLiquidity: intl.formatMessage({ defaultMessage: 'Order size exceeds the available liquidity.' }),
    maxLeverage: intl.formatMessage({ defaultMessage: 'Maximum leverage exceeded.' }),
    insufficientPosition: intl.formatMessage({ defaultMessage: 'Value exceeds position amount.' }),
    insufficientCollateral: intl.formatMessage({ defaultMessage: 'Value exceeds collateral amount.' }),
    requiredField: intl.formatMessage({ defaultMessage: 'This field is required.' }),
    exceedsMakerLimit: intl.formatMessage({ defaultMessage: 'Exceeds total maker limit' }),
    belowMinMaker: intl.formatMessage({ defaultMessage: 'Below minimum maker requirements' }),
    marketClosed: intl.formatMessage({ defaultMessage: 'Close only mode enabled. Only close positions allowed.' }),
    liquidityImbalance: intl.formatMessage({
      defaultMessage: 'Position opens or increases are not allowed until liquidity increases.',
    }),
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
  currentCollateral,
  minMargin,
}: {
  usdcBalance: bigint
  requiredMaintenance: bigint
  currentCollateral: bigint
  minMargin: bigint
}) {
  const copy = useErrorMessages()
  const isRequiredValidator = useIsRequiredValidator()

  const maxValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big6Math.fromFloatString(value)
      const balance = Big6Math.fromDecimals(usdcBalance, 6)
      if (Big6Math.max(0n, inputValue - currentCollateral) > balance) {
        return copy.insufficientFunds
      }
      return true
    }
  }, [usdcBalance, currentCollateral, copy.insufficientFunds])

  const minValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big6Math.fromFloatString(value)
      if (inputValue < requiredMaintenance) {
        return copy.belowReqMaintenance(formatBig6USDPrice(requiredMaintenance, { compact: true }))
      }

      if (inputValue && minMargin && inputValue < minMargin * 2n) {
        const minMaintenanceReq = formatBig6USDPrice(minMargin * 2n, { compact: true })

        return copy.belowMinMaintenance(minMaintenanceReq)
      }

      return true
    }
  }, [requiredMaintenance, copy, minMargin])

  return {
    max: maxValidator,
    min: minValidator,
    required: isRequiredValidator,
  }
}

export function usePositionValidators({
  isMaker,
  taker,
  takerLiquidity,
  makerLiquidity,
  maker,
  major,
  currentPositionAmount,
  makerLimit,
  efficiencyLimit,
  marketClosed,
  isSocialized,
}: {
  isMaker: boolean
  takerLiquidity: bigint
  makerLiquidity: bigint
  taker: bigint
  maker: bigint
  major: bigint
  currentPositionAmount: bigint
  makerLimit: bigint
  efficiencyLimit: bigint
  marketClosed: boolean
  isSocialized: boolean
}) {
  const copy = useErrorMessages()
  const isRequiredValidator = useIsRequiredValidator()

  const maxValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big6Math.fromFloatString(value)
      const positionDelta = inputValue - currentPositionAmount
      // Disallow increasing position if liquidity is insufficient
      if (positionDelta > 0n && positionDelta + taker > takerLiquidity) {
        return copy.insufficientLiquidity
      }

      // Disallow increasing position if market is closed
      if (marketClosed && positionDelta > 0n) {
        return copy.marketClosed
      }

      // Disallow increasing position if socialized
      if (isSocialized && positionDelta > 0n) {
        return copy.liquidityImbalance
      }
      return true
    }
  }, [
    currentPositionAmount,
    taker,
    takerLiquidity,
    marketClosed,
    isSocialized,
    copy.insufficientLiquidity,
    copy.marketClosed,
    copy.liquidityImbalance,
  ])

  const maxMakerValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big6Math.fromFloatString(value)
      const positionDelta = inputValue - currentPositionAmount
      // Disallow increasing position if exceeds maker limit
      if (positionDelta > 0n && maker + positionDelta > makerLimit) {
        return copy.exceedsMakerLimit
      }

      // Disallow increasing position if market is closed
      if (marketClosed && positionDelta > 0n) {
        return copy.marketClosed
      }
      return true
    }
  }, [makerLimit, maker, currentPositionAmount, marketClosed, copy.exceedsMakerLimit, copy.marketClosed])

  const minMakerValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big6Math.fromFloatString(value)
      const positionDelta = inputValue - currentPositionAmount

      if (marketClosed) return true // socialization does not apply in closed markets

      // Disallow decreasing position if liquidity is insufficient
      if (inputValue !== 0n && makerLiquidity - inputValue < major) {
        return copy.belowMinMaker
      }

      // Disallow decreasing position if below minimum efficiency
      if (positionDelta < 0n && efficiency(maker + positionDelta, major) < efficiencyLimit) {
        return copy.belowMinMaker
      }
      return true
    }
  }, [makerLiquidity, maker, major, marketClosed, efficiencyLimit, currentPositionAmount, copy.belowMinMaker])

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
  liquidity,
  maker,
  major,
  marketClosed,
  efficiencyLimit,
}: {
  currentPositionAmount: bigint
  isMaker: boolean
  liquidity: bigint
  maker: bigint
  major: bigint
  marketClosed: boolean
  efficiencyLimit: bigint
}) {
  const copy = useErrorMessages()
  const isRequiredValidator = useIsRequiredValidator()

  const maxValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big6Math.fromFloatString(value)
      if (inputValue > currentPositionAmount) {
        return copy.insufficientPosition
      }

      return true
    }
  }, [currentPositionAmount, copy.insufficientPosition])

  const maxMakerValidator = useMemo(() => {
    return (value: string) => {
      const inputValue = Big6Math.fromFloatString(value)

      if (inputValue > currentPositionAmount) {
        return copy.insufficientPosition
      }

      if (marketClosed) return true // socialization does not apply in closed markets

      // Disallow decreasing position if liquidity is insufficient
      if (inputValue !== 0n && liquidity - inputValue < major) {
        return copy.belowMinMaker
      }

      // Disallow decreasing position if below minimum efficiency
      if (inputValue !== 0n && efficiency(maker - inputValue, major) < efficiencyLimit) {
        return copy.belowMinMaker
      }

      return true
    }
  }, [
    currentPositionAmount,
    marketClosed,
    liquidity,
    major,
    maker,
    efficiencyLimit,
    copy.insufficientPosition,
    copy.belowMinMaker,
  ])
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
      const inputValue = Big6Math.fromFloatString(value)
      const fullClose = isFullClose(formValues.amount, nextPosition ?? 0n)
      if (!fullClose && inputValue > currentCollateral) {
        return copy.insufficientCollateral
      }
      const remainingCollateral = Big6Math.sub(currentCollateral, inputValue)
      if (!fullClose && !Big6Math.isZero(remainingCollateral) && remainingCollateral < minCollateral) {
        return copy.belowMinCollateral
      }
      if (remainingCollateral < requiredMaintenance) {
        return copy.belowReqMaintenance(formatBig6USDPrice(requiredMaintenance, { compact: true }))
      }
      return true
    }
  }, [nextPosition, currentCollateral, minCollateral, requiredMaintenance, copy])

  return { max: maxValidator, required: isRequiredValidator }
}
