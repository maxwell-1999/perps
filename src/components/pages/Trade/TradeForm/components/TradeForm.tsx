import { RepeatIcon } from '@chakra-ui/icons'
import { QuestionOutlineIcon } from '@chakra-ui/icons'
import { ButtonGroup, Divider, Flex, FormLabel, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { arbitrum } from 'viem/chains'

import Toggle, { BuyTradeHeader } from '@/components/shared/Toggle'
import { TxButton } from '@/components/shared/TxButton'
import { FormattedBig6USDPrice, USDCETooltip } from '@/components/shared/components'
import { Form } from '@/components/shared/components'
import { PositionSide2, PositionStatus, SupportedAsset, TriggerComparison } from '@/constants/markets'
import { useAuthStatus } from '@/contexts/authStatusContext'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { MarketSnapshot, UserMarketSnapshot, useMarketTransactions2 } from '@/hooks/markets2'
import { useAddress, useChainId } from '@/hooks/network'
import { useBalances } from '@/hooks/wallet'
import { Big6Math, formatBig6USDPrice } from '@/utils/big6Utils'
import { usePrevious } from '@/utils/hooks'
import {
  calcLiquidationPrice,
  calcNotional,
  calcTakerLiquidity,
  closedOrResolved,
  getPositionFromSelectedMarket,
  isFailedClose,
} from '@/utils/positionUtils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'
import colors from '@ds/theme/colors'

import { FormNames, OrderTypes, OrderValues, triggerOrderTypes } from '../constants'
import { useOnChangeHandlers, useStyles, useTradeFormCopy } from '../hooks'
import { calcMaxLeverage, formatInitialInputs } from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import LeverageInput from './LeverageInput'
import OrderTypeSelector from './OrderTypeSelector'
import { TradeReceipt } from './Receipt'
import { TriggerOrderForm } from './TriggerOrders/TriggerOrderForm'
import { LimitOrderInput, TriggerOrderInputGroup } from './TriggerOrders/components'
import { TriggerFormValues } from './TriggerOrders/constants'
import {
  GeoBlockedMessage,
  MarketClosedMessage,
  PaddedContainer,
  RestrictionMessage,
  SocializationMessage,
  TriggerBetaMessage,
  VpnDetectedMessage,
} from './styles'
import {
  useCollateralValidators,
  useLeverageValidators,
  useLimitPriceValidators,
  usePositionValidators,
  useStopLossValidator,
  useTakeProfitValidators,
} from './validatorHooks'

interface TradeFormProps {
  asset: SupportedAsset
  orderSide: PositionSide2.long | PositionSide2.short | PositionSide2.maker
  setOrderDirection: (orderDirection: PositionSide2.long | PositionSide2.short) => void
  market: MarketSnapshot
  position?: UserMarketSnapshot
  isRestricted: boolean
  isMobile?: boolean
}

function TradeForm(props: TradeFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const { geoblocked, vpnDetected } = useAuthStatus()
  const { orderSide: positionSide, setOrderDirection, market, position, isRestricted } = props
  const {
    market: marketAddress,
    global: { latestPrice },
    riskParameter: { margin, minMargin },
    parameter: { closed },
  } = market

  const prevProductAddress = usePrevious(marketAddress)
  const chainId = useChainId()
  const failedClose = isFailedClose(position)

  const { textColor, textBtnColor, textBtnHoverColor } = useStyles()
  const [selectedOrderType, setSelectedOrderType] = useState<OrderTypes>(OrderTypes.market)
  const [selectedLimitComparison, setSelectedLimitComparison] = useState<TriggerComparison>(
    positionSide === PositionSide2.long ? TriggerComparison.lte : TriggerComparison.gte,
  )
  const copy = useTradeFormCopy()
  const { data: balances } = useBalances()
  const { setTradeFormState } = useTradeFormState()
  const { address } = useAddress()
  const prevAddress = usePrevious(address)
  const {
    assetMetadata,
    isMaker,
    orderDirection,
    snapshots2,
    selectedMarket,
    selectedMakerMarket,
    overrideValues,
    setOverrideValues,
    manualCommitment,
  } = useMarketContext()
  const [orderValues, setOrderValues] = useState<OrderValues | null>(null)
  const positionStatus = position?.status ?? PositionStatus.resolved
  const hasPosition = !!getPositionFromSelectedMarket({
    isMaker,
    userMarketSnapshots: snapshots2?.user,
    selectedMarket,
    selectedMakerMarket,
  })
  const positionOrderDirection = hasPosition ? position?.nextSide : undefined
  const takerPositionDirection =
    positionOrderDirection === PositionSide2.long || positionOrderDirection === PositionSide2.short
      ? positionOrderDirection
      : undefined
  const currentPositionAmount = hasPosition ? position?.nextMagnitude ?? 0n : 0n
  const currentCollateral = position?.local.collateral ?? 0n
  const isNewPosition = Big6Math.isZero(currentPositionAmount) && Big6Math.isZero(currentCollateral)
  const userMaintenance = position?.maintenance ?? 0n
  const isSocialized = market.isSocialized && orderDirection === market.majorSide
  const prevOrderDirection = usePrevious(orderDirection)
  const prevSelectedOrderType = usePrevious(selectedOrderType)
  const { onSubmitVaa } = useMarketTransactions2(props.market.market)
  const isLimit = selectedOrderType === OrderTypes.limit

  const initialFormState = useMemo(
    () =>
      formatInitialInputs({
        userCollateral: currentCollateral,
        amount: currentPositionAmount,
        price: latestPrice,
        isNewPosition,
        isConnected: !!address,
        isFailedClose: failedClose,
      }),
    [currentCollateral, currentPositionAmount, latestPrice, isNewPosition, address, failedClose],
  )

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    resetField,
    trigger,
    formState: { dirtyFields, errors, isDirty },
  } = useForm({
    defaultValues: initialFormState,
  })

  const collateralHasInput = dirtyFields.collateral

  const collateral = watch(FormNames.collateral)
  const amount = watch(FormNames.amount)
  const leverage = watch(FormNames.leverage)
  const limitPrice = watch(FormNames.limitPrice)

  const maxLeverage = useMemo(
    () => calcMaxLeverage({ margin, minMargin, collateral: Big6Math.fromFloatString(collateral) }),
    [margin, minMargin, collateral],
  )

  const resetInputs = useCallback(() => {
    reset({ ...initialFormState })
  }, [initialFormState, reset])

  useEffect(() => {
    // Manually trigger leverage validation on maxLeverage change
    setTimeout(() => {
      trigger(FormNames.leverage)
    }, 0)
  }, [maxLeverage, trigger])

  useEffect(() => {
    if (orderDirection === PositionSide2.long) {
      setSelectedLimitComparison(TriggerComparison.lte)
    } else {
      setSelectedLimitComparison(TriggerComparison.gte)
    }
  }, [orderDirection])

  useEffect(() => {
    const userDisconnected = !address && !!prevAddress
    const userConnected = !!address && !prevAddress
    const changedProducts = marketAddress !== prevProductAddress
    const userSwitchedAcct = address !== prevAddress
    const changedDirection = market.isSocialized && orderDirection !== prevOrderDirection
    const orderTypeChanged = selectedOrderType !== prevSelectedOrderType

    const resetRequired = userConnected || userDisconnected || changedProducts || userSwitchedAcct || changedDirection

    if (resetRequired) {
      setSelectedOrderType(OrderTypes.market)
      resetInputs()
    }

    if (!position && triggerOrderTypes.includes(selectedOrderType)) {
      setSelectedOrderType(OrderTypes.market)
    }

    if (orderTypeChanged) {
      resetInputs()
    }

    const collateralChanged = initialFormState.collateral !== collateral
    if (!collateralHasInput && collateralChanged && !orderValues) {
      setValue(FormNames.collateral, initialFormState.collateral, { shouldValidate: false })
    }
  }, [
    address,
    prevAddress,
    marketAddress,
    prevProductAddress,
    collateralHasInput,
    initialFormState.collateral,
    collateral,
    setValue,
    resetInputs,
    orderValues,
    market.isSocialized,
    orderDirection,
    prevOrderDirection,
    position,
    selectedOrderType,
    prevSelectedOrderType,
  ])

  const {
    onChangeAmount,
    onChangeLeverage,
    onChangeCollateral,
    onChangeLimitPrice,
    onChangeLimitPricePercent,
    onChangeStopLoss,
    onChangeTakeProfit,
  } = useOnChangeHandlers({
    setValue,
    leverageFixed: false,
    leverage,
    collateral,
    amount,
    latestPrice,
    currentPosition: currentPositionAmount,
    marketSnapshot: market,
    chainId,
    positionStatus: position?.status ?? PositionStatus.resolved,
    direction: isMaker ? PositionSide2.maker : orderDirection,
    orderType: selectedOrderType,
    limitPrice,
  })

  const onConfirm = (orderData: { collateral: string; amount: string }) => {
    setOrderValues({ ...orderData })
  }

  const onConfirmTriggerOrder = ({ triggerAmount, stopLoss, takeProfit }: TriggerFormValues) => {
    if (!triggerAmount) return
    setOrderValues({ collateral, amount, stopLoss, takeProfit, triggerAmount })
  }

  const onWithdrawCollateral = () => {
    setTradeFormState(FormState.withdraw)
  }

  const closeAdjustmentModal = () => {
    if (overrideValues) {
      setOverrideValues(undefined)
      return
    }
    setOrderValues(null)
  }

  const cancelAdjustmentModal = () => {
    if (overrideValues) {
      setOverrideValues(undefined)
      return
    }
    setOrderValues(null)
    reset()
  }

  const onClickMaxCollateral = () => {
    return Big6Math.toFloatString(currentCollateral + Big6Math.fromDecimals(balances?.usdc ?? 0n, 6))
  }

  const positionDelta = useMemo(
    () => ({
      collateralDelta: Big6Math.fromFloatString(collateral) - currentCollateral,
      positionDelta: Big6Math.fromFloatString(amount) - currentPositionAmount,
    }),
    [collateral, amount, currentCollateral, currentPositionAmount],
  )

  const hasFormErrors = Object.keys(errors).length > 0
  const disableTradeBtn =
    (!positionDelta.positionDelta && !positionDelta.collateralDelta && position?.status !== PositionStatus.failed) ||
    hasFormErrors ||
    isRestricted

  const collateralValidators = useCollateralValidators({
    usdcBalance: balances?.usdc ?? 0n,
    requiredMaintenance: userMaintenance ?? 0n,
    currentCollateral,
    minMargin,
  })

  const availableLiquidity = calcTakerLiquidity(market)

  const liquidationPriceData = calcLiquidationPrice({
    marketSnapshot: market,
    collateral: Big6Math.fromFloatString(collateral),
    position: Big6Math.fromFloatString(amount),
  })

  const amountValidators = usePositionValidators({
    isMaker: isMaker,
    takerLiquidity:
      positionSide === 'long' ? availableLiquidity.totalLongLiquidity : availableLiquidity.totalShortLiquidity,
    makerLiquidity: market.nextPosition.maker + market.nextMinor,
    taker: market.nextPosition[positionSide],
    maker: market.nextPosition.maker,
    major: market.nextMajor,
    currentPositionAmount,
    makerLimit: market.riskParameter.makerLimit,
    efficiencyLimit: market.riskParameter.efficiencyLimit,
    marketClosed: closed || geoblocked,
    isSocialized: isSocialized,
  })
  const leverageValidators = useLeverageValidators({
    maxLeverage,
  })
  const limitPriceValidators = useLimitPriceValidators({
    orderType: selectedOrderType,
  })
  const stopPriceValidators = useStopLossValidator({
    orderDirection,
    latestPrice,
    isLimit,
    limitPrice: Big6Math.fromFloatString(limitPrice),
    liquidationPrice: liquidationPriceData[orderDirection],
  })
  const takeProfitValidators = useTakeProfitValidators({
    orderDirection,
    latestPrice,
    isLimit,
    limitPrice: Big6Math.fromFloatString(limitPrice),
  })

  const notional = calcNotional(Big6Math.fromFloatString(amount), latestPrice)
  const userBalance = formatBig6USDPrice(balances?.usdc, { fromUsdc: true }) ?? copy.zeroUsd

  const modalProps = overrideValues
    ? {
        orderValues: overrideValues.orderValues,
        asset: overrideValues.asset,
        positionDelta: overrideValues.positionDelta,
        positionSide: overrideValues.positionSide,
        market: overrideValues.market,
        position: overrideValues.position,
        isRetry: true,
      }
    : {
        title: isNewPosition ? copy.confirmOrder : copy.confirmChanges,
        orderValues: orderValues || { collateral: '0', amount: '0', leverage: '0' },
        asset: props.asset,
        positionDelta: positionDelta.positionDelta,
        positionSide,
        position,
        market,
      }

  return (
    <>
      {(orderValues || overrideValues) && (
        <AdjustPositionModal
          isOpen={!!orderValues || !!overrideValues}
          onClose={closeAdjustmentModal}
          onCancel={cancelAdjustmentModal}
          title={isNewPosition ? copy.confirmOrder : copy.confirmChanges}
          usdcAllowance={balances?.usdcAllowance ?? 0n}
          variant={'adjust'}
          orderType={selectedOrderType}
          selectedLimitComparison={selectedLimitComparison}
          {...modalProps}
        />
      )}
      <Flex justifyContent="space-between" paddingX={3} marginTop={2}>
        <BuyTradeHeader primary>
          {hasPosition && positionStatus !== PositionStatus.closed
            ? copy.modifyPosition
            : isMaker
            ? copy.Make
            : copy.trade}
        </BuyTradeHeader>
        {!!manualCommitment && (
          <TxButton
            variant="text"
            label={copy.submitCommitment}
            p={0}
            lineHeight={1}
            height="initial"
            fontSize="15px"
            color={textBtnColor}
            _hover={{ color: textBtnHoverColor }}
            onClick={onSubmitVaa}
            loadingText={copy.submitCommitment}
            actionAllowedInGeoblock
          />
        )}
      </Flex>
      {/* <OrderTypeSelector
        onClick={setSelectedOrderType}
        selectedOrderType={selectedOrderType}
        hasPosition={hasPosition}
        isRestricted={isRestricted}
      /> */}
      {triggerOrderTypes.includes(selectedOrderType) && position && !isMaker ? (
        <TriggerOrderForm
          selectedOrderType={selectedOrderType}
          userMarketSnapshot={position}
          orderDirection={orderDirection}
          onSubmit={onConfirmTriggerOrder}
        />
      ) : (
        <Form onSubmit={handleSubmit(onConfirm)} ref={formRef}>
          <div className="px-4">
            {geoblocked && !vpnDetected && <GeoBlockedMessage mb={4} />}
            {geoblocked && vpnDetected && <VpnDetectedMessage mb={4} />}
            {selectedOrderType !== OrderTypes.market && <TriggerBetaMessage mb={4} />}
            {closed && <MarketClosedMessage mb={4} />}
            {isRestricted && <RestrictionMessage message={copy.isRestricted(isMaker)} />}
            {position?.status === PositionStatus.failed && !failedClose && (
              <RestrictionMessage message={copy.settlementFailureBody} />
            )}
            {failedClose && <RestrictionMessage message={copy.closeFailure} />}
            {!isMaker && !triggerOrderTypes.includes(selectedOrderType) && (
              <Flex mb="14px">
                <Toggle<PositionSide2.long | PositionSide2.short>
                  labels={[PositionSide2.long, PositionSide2.short]}
                  activeLabel={takerPositionDirection ? takerPositionDirection : orderDirection}
                  onChange={setOrderDirection}
                  overrideValue={!closedOrResolved(positionStatus) ? takerPositionDirection : undefined}
                  activeColor={
                    takerPositionDirection
                      ? takerPositionDirection === PositionSide2.long
                        ? colors.brand.green
                        : colors.brand.red
                      : positionSide === PositionSide2.long
                      ? colors.brand.green
                      : colors.brand.red
                  }
                />
              </Flex>
            )}
            {isSocialized && <SocializationMessage mb={4} minorSide={market.minorSide} hasPosition={hasPosition} />}
            <Flex flexDirection="column" gap="13px">
              {!triggerOrderTypes.includes(selectedOrderType) && (
                <>
                  <Input
                    key={FormNames.collateral}
                    // eslint-disable-next-line formatjs/no-literal-string-in-jsx
                    label={copy.collateral}
                    labelColor="white"
                    title={copy.collateral}
                    isDisabled={selectedOrderType === OrderTypes.limit && hasPosition}
                    placeholder="0.0000"
                    max={onClickMaxCollateral}
                    rightLabel={
                      <FormLabel mr={0} mb={0}>
                        {!!address && (
                          <Flex gap={1}>
                            {chainId === arbitrum.id ? (
                              <USDCETooltip userBalance={userBalance} />
                            ) : (
                              <Text fontSize="12px">{userBalance}</Text>
                            )}
                          </Flex>
                        )}
                      </FormLabel>
                    }
                    rightEl={<InputFollower>{assetMetadata.quoteCurrency}</InputFollower>}
                    control={control}
                    name={FormNames.collateral}
                    onChange={(e) => onChangeCollateral(e.target.value)}
                    validate={!!address ? collateralValidators : {}}
                  />
                  <Input
                    key={FormNames.amount}
                    label={copy.amount}
                    labelColor="white"
                    placeholder="0.0000"
                    max={() => {
                      onChangeLeverage(maxLeverage + '')
                      return null
                    }}
                    rightLabel={
                      <FormLabel mr={0} mb={0}>
                        {notional > 0n && (
                          <FormattedBig6USDPrice
                            variant="label"
                            color="white"
                            value={
                              limitPrice
                                ? Big6Math.mul(Big6Math.fromFloatString(amount), Big6Math.fromFloatString(limitPrice))
                                : notional
                            }
                          />
                        )}
                      </FormLabel>
                    }
                    rightEl={<InputFollower>{assetMetadata.baseCurrency.toUpperCase()}</InputFollower>}
                    control={control}
                    name={FormNames.amount}
                    onChange={(e) => onChangeAmount(e.target.value)}
                    validate={!!address ? amountValidators : {}}
                  />
                </>
              )}
              {isLimit && (
                <LimitOrderInput
                  validate={limitPriceValidators}
                  onChangePercent={onChangeLimitPricePercent}
                  onChange={onChangeLimitPrice}
                  control={control}
                  rightEl={<Pill text={assetMetadata.quoteCurrency} />}
                  error={errors?.limitPrice}
                  hasPosition={hasPosition}
                  selectedLimitComparison={selectedLimitComparison}
                  setSelectedLimitComparison={(comparison: TriggerComparison) => setSelectedLimitComparison(comparison)}
                  latestPrice={latestPrice}
                  limitPrice={limitPrice}
                />
              )}
              {!triggerOrderTypes.includes(selectedOrderType) && (
                <LeverageInput
                  label={copy.leverage}
                  labelColor="white"
                  min={0}
                  max={maxLeverage}
                  step={0.1}
                  control={control}
                  name={FormNames.leverage}
                  onChange={onChangeLeverage}
                  validate={!!address ? leverageValidators : {}}
                />
              )}
              {/* {!triggerOrderTypes.includes(selectedOrderType) && !isMaker && !hasPosition && (
                <TriggerOrderInputGroup
                  validateStopLoss={stopPriceValidators}
                  validateTakeProfit={takeProfitValidators}
                  onChangeStopLoss={onChangeStopLoss}
                  onChangeTakeProfit={onChangeTakeProfit}
                  control={control}
                  rightEl={<Pill text={assetMetadata.quoteCurrency} />}
                  latestPrice={isLimit ? Big6Math.fromFloatString(limitPrice) : latestPrice}
                  collateral={collateral}
                  amount={amount}
                  errors={errors}
                  orderDirection={orderDirection}
                  resetField={resetField}
                  isFormDirty={isDirty}
                  isLimit={isLimit}
                />
              )} */}
            </Flex>
            <Flex height={6} width="100%" justifyContent="flex-end" px={2} mt={2}>
              {Object.keys(dirtyFields).length > 0 && (
                <Button
                  ml="auto"
                  justifyContent="flex-end"
                  height="100%"
                  variant="text"
                  p={0}
                  fontSize="12px"
                  label={copy.reset}
                  rightIcon={<RepeatIcon />}
                  onClick={resetInputs}
                  aria-label={copy.reset}
                />
              )}
            </Flex>
          </div>
          {/* <Divider mt="auto" /> */}
          <Flex flexDirection="column" px="16px" pb="10px">
            <TradeReceipt
              mb="12px"
              px="3px"
              product={market}
              positionDelta={positionDelta}
              positionDetails={position}
              leverage={parseFloat(leverage)}
              isLimit={isLimit}
              limitPrice={limitPrice}
            />
            {hasPosition && positionStatus !== PositionStatus.closed && positionStatus !== PositionStatus.closing ? (
              <ButtonGroup>
                <Button
                  variant="transparent"
                  className=" grey-bg"
                  label={copy.closePosition}
                  onClick={() => setTradeFormState(FormState.close)}
                />
                <TxButton
                  formRef={formRef}
                  flex={1}
                  label={position?.status === PositionStatus.failed ? copy.tryAgain : copy.modifyPosition}
                  type="submit"
                  isDisabled={disableTradeBtn}
                  overrideLabel
                  actionAllowedInGeoblock={positionDelta.positionDelta <= 0n} // allow closes and collateral changes in geoblock
                />
              </ButtonGroup>
            ) : (
              <TxButton
                formRef={formRef}
                type="submit"
                isDisabled={disableTradeBtn}
                label={
                  address
                    ? position?.status === PositionStatus.failed
                      ? copy.tryAgain
                      : copy.placeTrade
                    : copy.connectWallet
                }
                overrideLabel
              />
            )}
          </Flex>
          {!!address && !Big6Math.isZero(currentCollateral) && (
            <TxButton
              variant="text"
              label={copy.withdrawCollateral}
              p={0}
              lineHeight={1}
              height="initial"
              fontSize="13px"
              className="hover:underline"
              color={textBtnColor}
              _hover={{ color: textBtnHoverColor }}
              onClick={onWithdrawCollateral}
              isLoading={positionStatus === PositionStatus.closing}
              loadingText={copy.withdrawCollateral}
              actionAllowedInGeoblock
            />
          )}
        </Form>
      )}
    </>
  )
}

export default TradeForm

const InputFollower: React.FC<any> = ({ children }) => {
  return <div className="!bg-[#303044] h-full text-f14 justify-center items-center w-[60px] flex">{children}</div>
}

export { InputFollower }
