import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { useCallback, useEffect, useRef } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { SupportedAsset } from '@/constants/assets'
import { FormState } from '@/contexts/tradeFormContext'

import { FormNames } from './constants'
import {
  collateralFromAmountAndLeverage,
  leverageFromAmountAndCollateral,
  max18Decimals,
  positionFromCollateralAndLeverage,
} from './utils'

type MarketChangeProps = {
  selectedMarket: SupportedAsset
  formState: FormState
  setTradeFormState: (state: FormState) => void
}

export function useResetFormOnMarketChange({ selectedMarket, formState, setTradeFormState }: MarketChangeProps) {
  const prevMarketRef = useRef(selectedMarket)

  useEffect(() => {
    if (prevMarketRef.current !== selectedMarket && formState !== FormState.trade) {
      setTradeFormState(FormState.trade)
    }
    prevMarketRef.current = selectedMarket
  }, [selectedMarket, formState, setTradeFormState])
}

export function useStyles() {
  const { colors } = useTheme()
  const textColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const textBtnColor = colors.brand.purple[300]
  const textBtnHoverColor = colors.brand.purple[250]
  const dashedBorderColor = useColorModeValue(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])
  const percentBtnBg = useColorModeValue(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])

  return {
    textColor,
    textBtnColor,
    textBtnHoverColor,
    dashedBorderColor,
    percentBtnBg,
  }
}

export function useTradeFormCopy() {
  const intl = useIntl()
  return {
    trade: intl.formatMessage({ defaultMessage: 'Trade' }),
    max: intl.formatMessage({ defaultMessage: 'Max' }),
    addCollateral: intl.formatMessage({ defaultMessage: 'Add collateral' }),
    leverage: intl.formatMessage({ defaultMessage: 'Leverage' }),
    keepFixed: intl.formatMessage({ defaultMessage: 'Keep Fixed' }),
    placeTrade: intl.formatMessage({ defaultMessage: 'Place trade' }),
    close: intl.formatMessage({ defaultMessage: 'Close' }),
    modifyPosition: intl.formatMessage({ defaultMessage: 'Modify position' }),
    cancel: intl.formatMessage({ defaultMessage: 'Cancel' }),
    closePosition: intl.formatMessage({ defaultMessage: 'Close position' }),
    amountToClose: intl.formatMessage({ defaultMessage: 'Amount to close...' }),
    youWillReceive: intl.formatMessage({ defaultMessage: 'You will receive...' }),
    collateral: intl.formatMessage({ defaultMessage: 'Collateral' }),
    amount: intl.formatMessage({ defaultMessage: 'Amount' }),
    withdrawFunds: intl.formatMessage({ defaultMessage: 'Withdraw funds' }),
    withdrawCollateral: intl.formatMessage({ defaultMessage: 'Withdraw collateral' }),
    withdrawBodyText: intl.formatMessage({
      defaultMessage:
        'Please specify how much you would like to withdraw from the pool now that you have reduced your position size.',
    }),
    youCanNowWithdraw: intl.formatMessage({ defaultMessage: 'You can now withdraw...' }),
    youWillGet: intl.formatMessage({ defaultMessage: 'You will get...' }),
    withdrawConfirmText: intl.formatMessage({
      defaultMessage: 'You will receive a transaction request in your wallet upon clicking the button above.',
    }),
    zeroUsd: intl.formatMessage({ defaultMessage: '$0.00' }),
    openPosition: intl.formatMessage({ defaultMessage: 'Open position' }),
    connectWallet: intl.formatMessage({ defaultMessage: 'Connect wallet' }),
    confirmOrder: intl.formatMessage({ defaultMessage: 'Confirm Order' }),
    confirmChanges: intl.formatMessage({ defaultMessage: 'Confirm Changes' }),
  }
}

export function useReceiptCopy() {
  const intl = useIntl()
  return {
    entryExit: intl.formatMessage({ defaultMessage: 'Entry / Exit' }),
    priceImpact: intl.formatMessage({ defaultMessage: 'Price impact' }),
    liquidationPrice: intl.formatMessage({ defaultMessage: 'Liquidation price' }),
    tradingFee: intl.formatMessage({ defaultMessage: 'Trading fee' }),
  }
}
interface OnChangeHandlersArgs {
  setValue: UseFormSetValue<{ amount: string; collateral: string; leverage: number }>
  leverage: number
  collateral: string
  amount: string
  price: bigint
  leverageFixed: boolean
}

const setArgs = { shouldValidate: true }
export const useOnChangeHandlers = ({
  setValue,
  leverage,
  collateral,
  amount,
  price,
  leverageFixed,
}: OnChangeHandlersArgs) => {
  const onChangeAmount = useCallback(
    (newAmount: string) => {
      const validatedAmount = max18Decimals(newAmount)
      setValue(FormNames.amount, validatedAmount, { ...setArgs, shouldDirty: true })

      if (leverageFixed) {
        const newCollateralAmt = collateralFromAmountAndLeverage({
          amount: validatedAmount,
          leverage: `${leverage}`,
          price,
        })
        setValue(FormNames.collateral, newCollateralAmt, setArgs)
      } else {
        const newLeverage = leverageFromAmountAndCollateral({
          amount: validatedAmount,
          collateral,
          price,
        })
        setValue(FormNames.leverage, parseFloat(newLeverage), setArgs)
      }
    },
    [leverage, collateral, price, setValue, leverageFixed],
  )

  const onChangeLeverage = useCallback(
    (newLeverage: number) => {
      const validatedLeverage = max18Decimals(`${newLeverage}`)
      setValue(FormNames.leverage, parseFloat(validatedLeverage), { ...setArgs, shouldDirty: true })
      const newPosition = positionFromCollateralAndLeverage({
        collateral,
        leverage: validatedLeverage,
        price,
      })
      setValue(FormNames.amount, newPosition, setArgs)
    },
    [collateral, price, setValue],
  )

  const onChangeCollateral = useCallback(
    (newAmount: string) => {
      const validatedCollateral = max18Decimals(newAmount)
      setValue(FormNames.collateral, validatedCollateral, { ...setArgs, shouldDirty: true })

      if (leverageFixed) {
        const newPosition = positionFromCollateralAndLeverage({
          collateral: validatedCollateral,
          leverage: `${leverage}`,
          price,
        })
        setValue(FormNames.amount, newPosition, setArgs)
      } else {
        const newLeverage = leverageFromAmountAndCollateral({
          amount,
          collateral: validatedCollateral,
          price,
        })
        setValue(FormNames.leverage, parseFloat(newLeverage), setArgs)
      }
    },
    [leverage, amount, price, setValue, leverageFixed],
  )

  return { onChangeAmount, onChangeLeverage, onChangeCollateral }
}
