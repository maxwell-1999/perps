import { useColorModeValue, useTheme, useToast } from '@chakra-ui/react'
import { useCallback, useEffect, useRef } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { SocializationNotice } from '@/components/shared/components'
import { PositionSide2, PositionStatus, TriggerComparison } from '@/constants/markets'
import { SupportedChainId } from '@/constants/network'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState } from '@/contexts/tradeFormContext'
import { MarketSnapshot } from '@/hooks/markets2'
import { Big6Math } from '@/utils/big6Utils'
import { isNumbersOnly, isNumbersOnlyWithNegative } from '@/utils/formUtils'
import { usePrevious } from '@/utils/hooks'

import { FormNames, OrderTypes } from './constants'
import {
  collateralFromAmountAndLeverage,
  leverageFromAmountAndCollateral,
  positionFromCollateralAndLeverage,
} from './utils'

type MarketChangeProps = {
  formState: FormState
  setTradeFormState: (state: FormState) => void
}

export function useResetFormOnMarketChange({ formState, setTradeFormState }: MarketChangeProps) {
  const { selectedMarket, selectedMakerMarket, isMaker, userCurrentPosition, orderDirection, setOrderDirection } =
    useMarketContext()
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

  useEffect(() => {
    if (!userCurrentPosition) return
    if (userCurrentPosition.side === PositionSide2.long && orderDirection !== PositionSide2.long) {
      setOrderDirection(PositionSide2.long)
    }
    if (userCurrentPosition.side === PositionSide2.short && orderDirection !== PositionSide2.short) {
      setOrderDirection(PositionSide2.short)
    }
  }, [orderDirection, userCurrentPosition, setOrderDirection])
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
    submitCommitment: intl.formatMessage({ defaultMessage: 'Commit Price' }),
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
        { amount, asset: asset.toUpperCase(), direction },
      ),
    increase: intl.formatMessage({ defaultMessage: 'Increase' }),
    decrease: intl.formatMessage({ defaultMessage: 'Decrease' }),
    open: intl.formatMessage({ defaultMessage: 'Open' }),
    close: intl.formatMessage({ defaultMessage: 'Close' }),
    switchLeverageInput: intl.formatMessage({ defaultMessage: 'switch-leverage-input' }),
    Slider: intl.formatMessage({ defaultMessage: 'Slider' }),
    Make: intl.formatMessage({ defaultMessage: 'Advanced LP' }),
    isRestricted: (isMaker?: boolean) => {
      if (isMaker) {
        return intl.formatMessage({ defaultMessage: '* Maker positions unavailable while taker position open.' })
      }
      return intl.formatMessage({ defaultMessage: '* Taker positions unvailable while maker position open.' })
    },
    learnMore: intl.formatMessage({ defaultMessage: 'Learn more' }),
    settlementFailure: intl.formatMessage({
      defaultMessage: 'Settlement failure',
    }),
    settlementFailureTitle: intl.formatMessage({
      defaultMessage: 'Order failed: ',
    }),
    settlementFailureBody: intl.formatMessage({
      defaultMessage: 'Your last order failed to settle. Please re-submit your transaction.',
    }),
    tryAgain: intl.formatMessage({
      defaultMessage: 'Try again',
    }),
    maker: intl.formatMessage({ defaultMessage: 'Make' }),
    marketClosed: intl.formatMessage({ defaultMessage: '* Market is closed. Only close positions allowed' }),
    geoblocked: intl.formatMessage({
      defaultMessage: 'Application not available in your location. Only close positions allowed',
    }),
    modifyCollateral: intl.formatMessage({ defaultMessage: 'Modify Collateral' }),
    submit: intl.formatMessage({ defaultMessage: 'Submit' }),
    unsupportedRegion: intl.formatMessage({ defaultMessage: 'Unsupported region' }),
    unsupportedRegionMessage: (tosLink: React.ReactNode, closingPositions: React.ReactNode) =>
      intl.formatMessage(
        {
          defaultMessage:
            'This application is not supported in your region, only {closingPositions} is allowed. Please refer to our {tosLink}.',
        },
        { tosLink, closingPositions },
      ),
    vpnDetected: intl.formatMessage({ defaultMessage: 'VPN Detected' }),
    vpnDetectedMessage: (tosLink: React.ReactNode, closingPositions: React.ReactNode) =>
      intl.formatMessage(
        {
          defaultMessage:
            'This application cannot be used with VPN or Proxy software. Only {closingPositions} is allowed. Please refer to our {tosLink}.',
        },
        { tosLink, closingPositions },
      ),
    closingPositions: intl.formatMessage({ defaultMessage: 'closing positions' }),
    termsOfService: intl.formatMessage({ defaultMessage: 'terms of service' }),
    new: intl.formatMessage({ defaultMessage: 'New' }),
    marketClosedTitle: intl.formatMessage({ defaultMessage: 'Market Closed' }),
    marketClosedMessage: intl.formatMessage({
      defaultMessage: 'This market has closed. Only closing positions is allowed.',
    }),
    liquidityImbalance: intl.formatMessage({ defaultMessage: 'Temporary liquidity imbalance' }),
    liquidityImbalanceMessage: (minorSide: string) =>
      intl.formatMessage(
        {
          defaultMessage: 'Position opens or increases are not allowed until {minorSide} liquidity increases.',
        },
        { minorSide },
      ),
    reduceYourPosition: intl.formatMessage({ defaultMessage: 'Reducing your position will help balance the market.' }),
    closeFailure: intl.formatMessage({ defaultMessage: 'Your position failed to close. Please try again.' }),
    limitPrice: intl.formatMessage({ defaultMessage: 'Limit Price' }),
    percent: intl.formatMessage({ defaultMessage: '%' }),
    price: intl.formatMessage({ defaultMessage: 'Price' }),
    stopLoss: intl.formatMessage({ defaultMessage: 'Stop Loss' }),
    takeProfit: intl.formatMessage({ defaultMessage: 'Take Profit' }),
    add: intl.formatMessage({ defaultMessage: '+ Add' }),
    clear: intl.formatMessage({ defaultMessage: 'Clear' }),
    fromIndex: (percent: string) => intl.formatMessage({ defaultMessage: '{percent}% from index' }, { percent }),
    position: intl.formatMessage({ defaultMessage: 'Position' }),
    triggerPrice: intl.formatMessage({ defaultMessage: 'Trigger Price' }),
    placeOrder: intl.formatMessage({ defaultMessage: 'Place Order' }),
    indexPrice: intl.formatMessage({ defaultMessage: 'Index Price:' }),
    comparisonLabels: {
      [TriggerComparison.lte]: intl.formatMessage({ defaultMessage: 'Less than' }),
      [TriggerComparison.gte]: intl.formatMessage({ defaultMessage: 'Greater than' }),
    },
    executeAsMarketOrder: intl.formatMessage({ defaultMessage: 'Your order will execute as a market order.' }),
    liquidationPrice: intl.formatMessage({ defaultMessage: 'Liquidation Price' }),
    triggerBetaMessage: intl.formatMessage({
      defaultMessage: 'Limit and SL/TP orders are currently in beta. Order execution is not guaranteed.',
    }),
  }
}

export function useReceiptCopy() {
  const intl = useIntl()
  return {
    estEntry: intl.formatMessage({ defaultMessage: 'Est. Entry' }),
    estExit: intl.formatMessage({ defaultMessage: 'Est. Exit' }),
    priceImpact: intl.formatMessage({ defaultMessage: 'Est. Price Impact' }),
    liquidationPrice: intl.formatMessage({ defaultMessage: 'Liquidation Price' }),
    makerLiqPrice: intl.formatMessage({ defaultMessage: 'Liquidation Price (L/S)' }),
    tradingFee: intl.formatMessage({ defaultMessage: 'Trading Fee' }),
    hourlyFundingRate: intl.formatMessage({ defaultMessage: 'Funding Rate (1h)' }),
    collateral: intl.formatMessage({ defaultMessage: 'Collateral' }),
    leverage: intl.formatMessage({ defaultMessage: 'Leverage' }),
    exposure: intl.formatMessage({ defaultMessage: 'Exposure' }),
    fundingFees: intl.formatMessage({ defaultMessage: 'Est. Funding Fee APR' }),
    tradingFees: intl.formatMessage({ defaultMessage: 'Est. Trading Fee APR' }),
    totalAPR: intl.formatMessage({ defaultMessage: 'Total APR' }),
    totalAprCalculation: intl.formatMessage(
      {
        defaultMessage:
          'Funding Fee APR + Trading Fee APR {br} APR values are calculated using the last 7 days of market activity',
      },
      { br: <br /> },
    ),
    feeBasisPoints: intl.formatMessage({ defaultMessage: 'Market Fee:' }),
    noValue: intl.formatMessage({ defaultMessage: '--' }),
    settlementFee: intl.formatMessage({ defaultMessage: 'Settlement Fee:' }),
    interfaceFee: intl.formatMessage({ defaultMessage: 'Ecosystem Fee:' }),
  }
}

export type TradeFormValues = {
  amount: string
  collateral: string
  leverage: string
  limitPrice: string
  limitPricePercent: string
  stopLoss: string
  takeProfit: string
}

interface OnChangeHandlersArgs {
  setValue: UseFormSetValue<TradeFormValues>
  leverage: string
  collateral: string
  amount: string
  limitPrice?: string
  leverageFixed: boolean
  currentPosition: bigint
  latestPrice: bigint
  marketSnapshot: MarketSnapshot
  chainId: SupportedChainId
  positionStatus: PositionStatus
  direction: PositionSide2
  orderType?: OrderTypes
}

const setArgs = { shouldValidate: true, shouldDirty: true }

export const useOnChangeHandlers = ({
  setValue,
  leverage,
  collateral,
  amount,
  limitPrice,
  latestPrice,
  leverageFixed,
  currentPosition,
  marketSnapshot,
  chainId,
  positionStatus,
  direction,
  orderType,
}: OnChangeHandlersArgs) => {
  const onChangeAmount = useCallback(
    (newAmount: string) => {
      if (!isNumbersOnly(newAmount)) return
      const validatedAmount = Big6Math.max6Decimals(newAmount)
      setValue(FormNames.amount, validatedAmount, setArgs)

      if (leverageFixed) {
        const newCollateralAmt = collateralFromAmountAndLeverage({
          currentAmount: currentPosition,
          amount: validatedAmount,
          leverage,
          marketSnapshot,
          chainId,
          positionStatus,
          direction,
        })
        setValue(FormNames.collateral, newCollateralAmt, setArgs)
      } else {
        const newLeverage = leverageFromAmountAndCollateral({
          currentAmount: currentPosition,
          amount: validatedAmount,
          collateral,
          marketSnapshot,
          chainId,
          positionStatus,
          direction,
          orderType,
          limitPrice,
        })
        setValue(FormNames.leverage, newLeverage, setArgs)
      }
    },
    [
      setValue,
      leverageFixed,
      currentPosition,
      leverage,
      marketSnapshot,
      chainId,
      positionStatus,
      direction,
      collateral,
      orderType,
      limitPrice,
    ],
  )

  const onChangeLeverage = useCallback(
    (newLeverage: string) => {
      if (!isNumbersOnly(newLeverage)) return
      const validatedLeverage = Big6Math.max6Decimals(newLeverage)
      setValue(FormNames.leverage, validatedLeverage, setArgs)
      // todo: set position after fees?
      const newPosition = positionFromCollateralAndLeverage({
        currentAmount: currentPosition,
        collateral,
        leverage: validatedLeverage,
        marketSnapshot,
        chainId,
        positionStatus,
        direction,
        orderType,
        limitPrice,
      })
      setValue(FormNames.amount, newPosition, setArgs)
    },
    [chainId, collateral, currentPosition, direction, marketSnapshot, positionStatus, setValue, orderType, limitPrice],
  )

  const onChangeCollateral = useCallback(
    (newAmount: string) => {
      if (!isNumbersOnly(newAmount)) return
      const validatedCollateral = Big6Math.max6Decimals(newAmount)
      setValue(FormNames.collateral, validatedCollateral, setArgs)

      if (leverageFixed) {
        const newPosition = positionFromCollateralAndLeverage({
          currentAmount: currentPosition,
          collateral: validatedCollateral,
          leverage: `${leverage}`,
          marketSnapshot,
          chainId,
          positionStatus,
          direction,
        })
        setValue(FormNames.amount, newPosition, setArgs)
      } else {
        const newLeverage = leverageFromAmountAndCollateral({
          currentAmount: currentPosition,
          amount,
          collateral: validatedCollateral,
          marketSnapshot,
          chainId,
          positionStatus,
          direction,
          limitPrice,
          orderType,
        })
        setValue(FormNames.leverage, newLeverage, setArgs)
      }
    },
    [
      setValue,
      leverageFixed,
      currentPosition,
      leverage,
      marketSnapshot,
      chainId,
      positionStatus,
      direction,
      amount,
      limitPrice,
      orderType,
    ],
  )

  const onChangeLimitPrice = useCallback(
    (newLimitPrice: string) => {
      if (!isNumbersOnly(newLimitPrice)) return
      const validatedLimitPrice = Big6Math.max6Decimals(newLimitPrice)
      setValue(FormNames.limitPrice, validatedLimitPrice, setArgs)

      const limitBigInt = Big6Math.fromFloatString(validatedLimitPrice)
      const difference = Big6Math.sub(limitBigInt, latestPrice)
      const percentChangeBigInt = Big6Math.div(Big6Math.mul(difference, Big6Math.BASE * 100n), latestPrice)
      const percentChangeString = Big6Math.toFloatString(percentChangeBigInt)
      setValue(FormNames.limitPricePercent, percentChangeString, setArgs)

      const newLeverage = leverageFromAmountAndCollateral({
        currentAmount: currentPosition,
        amount,
        collateral,
        marketSnapshot,
        chainId,
        positionStatus,
        direction,
        orderType,
        limitPrice: validatedLimitPrice,
      })
      setValue(FormNames.leverage, newLeverage, setArgs)
    },
    [
      setValue,
      latestPrice,
      chainId,
      collateral,
      currentPosition,
      direction,
      amount,
      marketSnapshot,
      orderType,
      positionStatus,
    ],
  )

  const onChangeLimitPricePercent = useCallback(
    (newLimitPricePercent: string) => {
      if (!isNumbersOnlyWithNegative(newLimitPricePercent)) return
      const validatedLimitPricePercent = Big6Math.max6Decimals(newLimitPricePercent)
      setValue(FormNames.limitPricePercent, validatedLimitPricePercent, setArgs)

      const limitPricePercentBigInt = Big6Math.fromFloatString(validatedLimitPricePercent)
      const percentIncrease = Big6Math.div(Big6Math.mul(latestPrice, limitPricePercentBigInt), Big6Math.BASE * 100n)
      const newLimitBigInt = Big6Math.add(latestPrice, percentIncrease)
      const newLimitString = Big6Math.toFloatString(newLimitBigInt)

      setValue(FormNames.limitPrice, newLimitString, setArgs)
      const newLeverage = leverageFromAmountAndCollateral({
        currentAmount: currentPosition,
        amount,
        collateral,
        marketSnapshot,
        chainId,
        positionStatus,
        direction,
        orderType,
        limitPrice: newLimitString,
      })
      setValue(FormNames.leverage, newLeverage, setArgs)
    },
    [
      setValue,
      latestPrice,
      chainId,
      collateral,
      currentPosition,
      direction,
      amount,
      marketSnapshot,
      orderType,
      positionStatus,
    ],
  )

  const onChangeStopLoss = useCallback(
    (newStopLoss: string) => {
      if (!isNumbersOnly(newStopLoss)) return
      const validatedStopLoss = Big6Math.max6Decimals(newStopLoss)
      setValue(FormNames.stopLoss, validatedStopLoss, setArgs)
    },
    [setValue],
  )

  const onChangeTakeProfit = useCallback(
    (newTakeProfit: string) => {
      if (!isNumbersOnly(newTakeProfit)) return
      const validatedTakeProfit = Big6Math.max6Decimals(newTakeProfit)
      setValue(FormNames.takeProfit, validatedTakeProfit, setArgs)
    },
    [setValue],
  )

  return {
    onChangeAmount,
    onChangeLeverage,
    onChangeCollateral,
    onChangeLimitPrice,
    onChangeLimitPricePercent,
    onChangeStopLoss,
    onChangeTakeProfit,
  }
}

export const useSocializationAlert = () => {
  const { selectedMarketSnapshot2, isMaker } = useMarketContext()
  const toast = useToast()
  const prevMarketSnapshot = usePrevious(selectedMarketSnapshot2)

  if (
    prevMarketSnapshot?.asset !== selectedMarketSnapshot2?.asset ||
    !prevMarketSnapshot ||
    !selectedMarketSnapshot2 ||
    isMaker
  ) {
    return
  }

  if (!prevMarketSnapshot.isSocialized && selectedMarketSnapshot2.isSocialized) {
    toast({
      duration: null,
      render: ({ onClose }) => <SocializationNotice onClose={onClose} />,
    })
  }
}
