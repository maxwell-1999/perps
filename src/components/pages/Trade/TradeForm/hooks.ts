import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { useEffect, useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'
import { formatEther } from 'viem'

import { Currency, SupportedAsset } from '@/constants/assets'
import { FormState } from '@/contexts/tradeFormContext'

import { calculateInitialLeverage } from './utils'

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
  userCollateral?: bigint
  amount: bigint
  price: bigint
  isNewPosition: boolean
}

export const useInitialInputs = ({ userCollateral, amount, price, isNewPosition }: UseInitialInputs) =>
  useMemo(() => {
    const formattedCollateral = formatEther(userCollateral ?? 0n)
    const formattedAmount = formatEther(amount)
    return {
      currency: Currency.USDC,
      positionAmount: formattedAmount === '0.0' ? '0' : formattedAmount,
      collateralAmount: formattedCollateral === '0.0' ? '0' : formattedCollateral,
      isLeverageFixed: false,
      leverage: calculateInitialLeverage({ isNewPosition, amount, currentCollateralAmount: userCollateral, price }),
    }
  }, [userCollateral, amount, price, isNewPosition])
