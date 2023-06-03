import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { useEffect, useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'
import { formatEther } from 'viem'

import { Currency, SupportedAsset } from '@/constants/assets'
import { FormState } from '@/contexts/tradeFormContext'

import { Action, ActionTypes } from './reducer'
import {
  calculateAndUpdateCollateral,
  calculateAndUpdateLeverage,
  calculateAndUpdatePosition,
  calculateInitialLeverage,
  max18Decimals,
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

export const getContainerVariant = (formState: FormState) => {
  switch (formState) {
    case FormState.modify:
      return 'active'
    case FormState.close:
    case FormState.withdraw:
      return 'pink'
    default:
      return 'transparent'
  }
}

type UseInitialInputs = {
  userCollateral: bigint
  amount: bigint
  price: bigint
  isNewPosition: boolean
}

export const useInitialInputs = ({ userCollateral, amount, price, isNewPosition }: UseInitialInputs) =>
  useMemo(() => {
    const formattedCollateral = formatEther(userCollateral)
    const formattedAmount = formatEther(amount)
    return {
      currency: Currency.USDC,
      collateralAmount: formattedCollateral === '0.0' ? '0' : formattedCollateral,
      positionAmount: formattedAmount === '0.0' ? '0' : formattedAmount,
      isLeverageFixed: false,
      leverage: calculateInitialLeverage({ isNewPosition, amount, currentCollateralAmount: userCollateral, price }),
    }
  }, [userCollateral, amount, price, isNewPosition])

// Define the types for the object argument
interface OnChangeHandlersArgs {
  dispatch: React.Dispatch<Action>
  isLeverageFixed: boolean
  leverage: string
  collateralAmountStr: string
  positionAmountStr: string
  price: bigint
}

// Define the custom hook
export const useOnChangeHandlers = ({
  dispatch,
  isLeverageFixed,
  leverage,
  collateralAmountStr,
  positionAmountStr,
  price,
}: OnChangeHandlersArgs) => {
  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value
    const validatedAmount = max18Decimals(newAmount)
    dispatch({ type: ActionTypes.SET_POSITION_AMOUNT, payload: validatedAmount })

    if (isLeverageFixed) {
      const newCollateralAmt = calculateAndUpdateCollateral({ amount: validatedAmount, leverage, price })
      dispatch({ type: ActionTypes.SET_COLLATERAL_AMOUNT, payload: newCollateralAmt })
    } else {
      const newLeverage = calculateAndUpdateLeverage({
        amount: validatedAmount,
        collateral: collateralAmountStr,
        price,
      })
      dispatch({ type: ActionTypes.SET_LEVERAGE, payload: newLeverage })
    }
  }

  const onChangeLeverage = (newLeverage: number) => {
    const validatedLeverage = max18Decimals(`${newLeverage}`)
    dispatch({ type: ActionTypes.SET_LEVERAGE, payload: validatedLeverage })
    const newPosition = calculateAndUpdatePosition({
      collateral: collateralAmountStr,
      leverage: validatedLeverage,
      price,
    })
    dispatch({ type: ActionTypes.SET_POSITION_AMOUNT, payload: newPosition })
  }

  const onChangeCollateral = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value
    const validatedAmount = max18Decimals(newAmount)
    dispatch({ type: ActionTypes.SET_COLLATERAL_AMOUNT, payload: validatedAmount })
    dispatch({ type: ActionTypes.SET_COLLATERAL_HAS_INPUT, payload: true })

    if (isLeverageFixed) {
      const newPosition = calculateAndUpdatePosition({
        collateral: collateralAmountStr,
        leverage,
        price,
      })
      dispatch({ type: ActionTypes.SET_POSITION_AMOUNT, payload: newPosition })
    } else {
      const newLeverage = calculateAndUpdateLeverage({
        amount: positionAmountStr,
        collateral: validatedAmount,
        price,
      })
      dispatch({ type: ActionTypes.SET_LEVERAGE, payload: newLeverage })
    }
  }

  return { onChangeAmount, onChangeLeverage, onChangeCollateral }
}

// const { onChangeAmount, onChangeLeverage, onChangeCollateral } = useOnChangeHandlers({
//   dispatch,
//   isLeverageFixed: state.isLeverageFixed,
//   leverage: state.leverage,
//   collateralAmountStr: state.collateralAmountStr,
//   positionAmountStr: state.positionAmountStr,
//   price: product.latestVersion.price
// })
