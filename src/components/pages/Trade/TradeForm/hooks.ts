import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { useCallback, useEffect, useRef } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { SupportedAsset, SupportedMakerMarket } from '@/constants/assets'
import { FormState } from '@/contexts/tradeFormContext'
import { isNumbersOnly } from '@/utils/formUtils'

import { FormNames } from './constants'
import {
  collateralFromAmountAndLeverage,
  leverageFromAmountAndCollateral,
  max18Decimals,
  positionFromCollateralAndLeverage,
} from './utils'

type MarketChangeProps = {
  selectedMarket: SupportedAsset
  selectedMakerMarket: SupportedMakerMarket
  formState: FormState
  setTradeFormState: (state: FormState) => void
  isMaker?: boolean
}

export function useResetFormOnMarketChange({
  selectedMarket,
  formState,
  setTradeFormState,
  selectedMakerMarket,
  isMaker,
}: MarketChangeProps) {
  const prevMarketRef = useRef(selectedMarket)
  const prevMakerMarketRef = useRef(selectedMakerMarket)

  useEffect(() => {
    if (isMaker && prevMakerMarketRef.current !== selectedMakerMarket && formState !== FormState.trade) {
      setTradeFormState(FormState.trade)
    }
    if (!isMaker && prevMarketRef.current !== selectedMarket && formState !== FormState.trade) {
      setTradeFormState(FormState.trade)
    }
    prevMarketRef.current = selectedMarket
    prevMakerMarketRef.current = selectedMakerMarket
  }, [selectedMarket, formState, setTradeFormState, selectedMakerMarket, isMaker])
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
    modifyPosition: intl.formatMessage({ defaultMessage: 'Modify position' }),
    cancel: intl.formatMessage({ defaultMessage: 'Cancel' }),
    closePosition: intl.formatMessage({ defaultMessage: 'Close position' }),
    collateralAfterFees: intl.formatMessage({ defaultMessage: 'Collateral (after fees)' }),
    collateral: intl.formatMessage({ defaultMessage: 'Collateral' }),
    amount: intl.formatMessage({ defaultMessage: 'Amount' }),
    withdrawFunds: intl.formatMessage({ defaultMessage: 'Withdraw funds' }),
    withdrawCollateral: intl.formatMessage({ defaultMessage: 'Withdraw Collateral' }),
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
    reset: intl.formatMessage({ defaultMessage: 'Reset' }),
    crossCollateralInfo: (crossCollateralAmount: string, oppositeSide: string) =>
      intl.formatMessage(
        {
          defaultMessage: '* Includes {crossCollateralAmount} from {oppositeSide} market',
        },
        { crossCollateralAmount, oppositeSide },
      ),
    positionSettled: intl.formatMessage({ defaultMessage: 'Position settled' }),
    positionOpened: intl.formatMessage({ defaultMessage: 'Position Opened' }),
    long: intl.formatMessage({ defaultMessage: 'Long' }),
    short: intl.formatMessage({ defaultMessage: 'Short' }),
    orderSettled: intl.formatMessage({ defaultMessage: 'Order Settled' }),
    orderDetailToast: (amount: string, asset: string, direction: string) =>
      intl.formatMessage(
        {
          defaultMessage: '{direction} {asset} {amount}',
        },
        { amount, asset, direction },
      ),
    increase: intl.formatMessage({ defaultMessage: 'Increase' }),
    decrease: intl.formatMessage({ defaultMessage: 'Decrease' }),
    open: intl.formatMessage({ defaultMessage: 'Open' }),
    close: intl.formatMessage({ defaultMessage: 'Close' }),
    switchLeverageInput: intl.formatMessage({ defaultMessage: 'switch-leverage-input' }),
    Slider: intl.formatMessage({ defaultMessage: 'Slider' }),
    Make: intl.formatMessage({ defaultMessage: 'Make' }),
    isRestricted: (isMaker?: boolean) => {
      if (isMaker) {
        return intl.formatMessage({ defaultMessage: '* Maker positions unavailable while taker position open' })
      }
      return intl.formatMessage({ defaultMessage: '* Taker positions unvailable while maker position open' })
    },
  }
}

export function useReceiptCopy() {
  const intl = useIntl()
  return {
    estEntry: intl.formatMessage({ defaultMessage: 'Est. Entry' }),
    estExit: intl.formatMessage({ defaultMessage: 'Est. Exit' }),
    priceImpact: intl.formatMessage({ defaultMessage: 'Price impact' }),
    liquidationPrice: intl.formatMessage({ defaultMessage: 'Liquidation price' }),
    tradingFee: intl.formatMessage({ defaultMessage: 'Trading fee' }),
    hourlyFundingRate: intl.formatMessage({ defaultMessage: 'Funding Rate (1h)' }),
    collateral: intl.formatMessage({ defaultMessage: 'Collateral' }),
    leverage: intl.formatMessage({ defaultMessage: 'Leverage' }),
    currentExposure: intl.formatMessage({ defaultMessage: 'Current Exposure' }),
    fundingFees: intl.formatMessage({ defaultMessage: 'Funding Fee APR' }),
    tradingFees: intl.formatMessage({ defaultMessage: 'Trading Fee APR' }),
    totalAPR: intl.formatMessage({ defaultMessage: 'Total APR' }),
    tradingFeeCalculation: intl.formatMessage({
      defaultMessage: 'Calculated from: (7d Fee Avg * 52w * Notional) / (Total Maker Notional * Collateral)',
    }),
    totalAprCalculation: intl.formatMessage({
      defaultMessage: 'Calculated from: Funding Fee APR + Trading Fee APR',
    }),
    tooltipFee: (rate: string) => intl.formatMessage({ defaultMessage: 'Open/Close Fee: {rate}%' }, { rate }),
  }
}

export type TradeFormValues = { amount: string; collateral: string; leverage: string }
interface OnChangeHandlersArgs {
  setValue: UseFormSetValue<TradeFormValues>
  leverage: string
  collateral: string
  amount: string
  price: bigint
  leverageFixed: boolean
}

const setArgs = { shouldValidate: true, shouldDirty: true }

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
      if (!isNumbersOnly(newAmount)) return
      const validatedAmount = max18Decimals(newAmount)
      setValue(FormNames.amount, validatedAmount, setArgs)

      if (leverageFixed) {
        const newCollateralAmt = collateralFromAmountAndLeverage({
          amount: validatedAmount,
          leverage,
          price,
        })
        setValue(FormNames.collateral, newCollateralAmt, setArgs)
      } else {
        const newLeverage = leverageFromAmountAndCollateral({
          amount: validatedAmount,
          collateral,
          price,
        })
        setValue(FormNames.leverage, newLeverage, setArgs)
      }
    },
    [leverage, collateral, price, setValue, leverageFixed],
  )

  const onChangeLeverage = useCallback(
    (newLeverage: string) => {
      if (!isNumbersOnly(newLeverage)) return
      const validatedLeverage = max18Decimals(newLeverage)
      setValue(FormNames.leverage, validatedLeverage, setArgs)
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
      if (!isNumbersOnly(newAmount)) return
      const validatedCollateral = max18Decimals(newAmount)
      setValue(FormNames.collateral, validatedCollateral, setArgs)

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
        setValue(FormNames.leverage, newLeverage, setArgs)
      }
    },
    [leverage, amount, price, setValue, leverageFixed],
  )

  return { onChangeAmount, onChangeLeverage, onChangeCollateral }
}
