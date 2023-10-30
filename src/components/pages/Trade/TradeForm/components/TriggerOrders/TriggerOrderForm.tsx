import { RepeatIcon } from '@chakra-ui/icons'
import { Flex, FormLabel, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button, DataRow } from '@/components/design-system'
import { Input, Pill } from '@/components/design-system/Input'
import colors from '@/components/design-system/theme/colors'
import { TxButton } from '@/components/shared/TxButton'
import { Form } from '@/components/shared/components'
import { PositionSide2, SupportedAsset } from '@/constants/markets'
import { useLivePriceContext } from '@/contexts/livePriceContext'
import { useMarketContext } from '@/contexts/marketContext'
import { MarketSnapshot, UserMarketSnapshot } from '@/hooks/markets2'
import { Big6Math, formatBig6, formatBig6USDPrice } from '@/utils/big6Utils'
import { usePrevious } from '@/utils/hooks'
import { calcLiquidationPrice, isFailedClose } from '@/utils/positionUtils'

import { FormNames, OrderTypes } from '../../constants'
import { TradeFormValues, useTradeFormCopy } from '../../hooks'
import { PaddedContainer, TriggerBetaMessage } from '../styles'
import { useStopLossValidator, useTakeProfitValidators, useTriggerAmountValidators } from '../validatorHooks'
import { PercentValueShortcuts, PositionDisplay } from './components'
import { TriggerFormValues, getInitialTriggerFormState, stopLossPercents, takeProfitPercents } from './constants'
import { calcTriggerOrderPrice, useTriggerOnChangeHandlers } from './hooks'

interface TriggerOrderFormProps {
  selectedOrderType: OrderTypes
  userMarketSnapshot: UserMarketSnapshot
  orderDirection: PositionSide2.long | PositionSide2.short
  onSubmit: (orderData: TriggerFormValues | Partial<TradeFormValues>) => void
  overrides?: {
    selectedMarket: SupportedAsset
    selectedMarketSnapshot?: MarketSnapshot
    positionSize?: bigint
  }
  noPadding?: boolean
}

export function TriggerOrderForm({
  selectedOrderType,
  userMarketSnapshot,
  orderDirection,
  onSubmit,
  overrides,
  noPadding,
}: TriggerOrderFormProps) {
  const copy = useTradeFormCopy()
  const { assetMetadata, selectedMarket, selectedMarketSnapshot2 } = useMarketContext()
  const prevSelectedOrderType = usePrevious(selectedOrderType)
  const livePrices = useLivePriceContext()

  const market = overrides ? overrides.selectedMarket : selectedMarket
  const selectedMarketSnapshot = overrides ? overrides.selectedMarketSnapshot : selectedMarketSnapshot2
  const _latestPrice = overrides
    ? overrides.selectedMarketSnapshot?.global.latestPrice
    : selectedMarketSnapshot2?.global.latestPrice
  const latestPrice = _latestPrice ?? 0n

  const indexPrice = livePrices[market] ?? latestPrice ?? 0n

  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: getInitialTriggerFormState(Big6Math.toFloatString(indexPrice)),
  })

  useEffect(() => {
    if (selectedOrderType !== prevSelectedOrderType) {
      reset(getInitialTriggerFormState(Big6Math.toFloatString(indexPrice)))
    }
  }, [selectedOrderType, prevSelectedOrderType, indexPrice, reset])

  const resetForm = () => {
    reset(getInitialTriggerFormState(Big6Math.toFloatString(indexPrice)))
  }

  const stopLoss = watch(FormNames.stopLoss)
  const takeProfit = watch(FormNames.stopLoss)
  const triggerAmount = watch(FormNames.triggerAmount)

  const positionSize = overrides?.positionSize
    ? overrides.positionSize
    : isFailedClose(userMarketSnapshot)
    ? userMarketSnapshot.magnitude
    : userMarketSnapshot.nextMagnitude

  const liquidationPriceData = calcLiquidationPrice({
    marketSnapshot: selectedMarketSnapshot,
    collateral: userMarketSnapshot.local.collateral,
    position: positionSize,
  })

  const { onChangeStopLoss, onChangeTakeProfit, onChangeTriggerAmount } = useTriggerOnChangeHandlers({
    setValue,
  })
  const stopPriceValidators = useStopLossValidator({
    orderDirection,
    latestPrice,
    isLimit: false,
    liquidationPrice: liquidationPriceData[orderDirection],
  })
  const takeProfitValidators = useTakeProfitValidators({
    orderDirection,
    latestPrice,
    isLimit: false,
  })
  const triggerAmountValidator = useTriggerAmountValidators({
    position: positionSize,
  })

  const liquidationPrice = liquidationPriceData[orderDirection]

  const onPercentClick = (percent: string) => {
    const triggerPrices = calcTriggerOrderPrice({
      percent,
      orderDirection,
      latestPrice,
      positionSize,
      collateral: userMarketSnapshot.local.collateral,
      orderType: selectedOrderType,
    })
    if (selectedOrderType === OrderTypes.stopLoss) {
      onChangeStopLoss(`${triggerPrices.triggerPrice}`)
    } else {
      onChangeTakeProfit(`${triggerPrices.triggerPrice}`)
    }
  }

  const onClickMax = () => {
    onChangeTriggerAmount(Big6Math.toFloatString(positionSize))
  }

  const hasFormErrors = Object.keys(errors).length > 0
  const disableTradeButton =
    hasFormErrors ||
    !triggerAmount ||
    (selectedOrderType === OrderTypes.stopLoss && !stopLoss) ||
    (selectedOrderType === OrderTypes.takeProfit && !takeProfit)

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <PaddedContainer gap="13px" height="100%" p={noPadding ? 0 : 4} pb={noPadding ? 0 : 2}>
        <TriggerBetaMessage />
        <PositionDisplay position={positionSize} orderDirection={orderDirection} asset={market} />
        {selectedOrderType === OrderTypes.stopLoss && (
          <>
            <Input
              name={FormNames.stopLoss}
              labelColor="white"
              label={copy.triggerPrice}
              validate={stopPriceValidators}
              onChange={(e) => {
                onChangeStopLoss(e.target.value)
              }}
              rightEl={<Pill text={assetMetadata.quoteCurrency} />}
              rightLabel={<IndexPriceLabel latestPrice={indexPrice} />}
              control={control}
            />
            {!overrides?.positionSize && (
              <PercentValueShortcuts percentValues={stopLossPercents} onPercentClick={onPercentClick} />
            )}
            <DataRow
              label={copy.liquidationPrice}
              value={
                <Text fontSize="13px" color={colors.brand.red}>
                  {formatBig6USDPrice(liquidationPrice)}
                </Text>
              }
            />
          </>
        )}
        {selectedOrderType === OrderTypes.takeProfit && (
          <>
            <Input
              name={FormNames.takeProfit}
              labelColor="white"
              label={copy.triggerPrice}
              validate={takeProfitValidators}
              onChange={(e) => {
                onChangeTakeProfit(e.target.value)
              }}
              rightEl={<Pill text={assetMetadata.quoteCurrency} />}
              rightLabel={<IndexPriceLabel latestPrice={indexPrice} />}
              control={control}
            />
            <PercentValueShortcuts percentValues={takeProfitPercents} onPercentClick={onPercentClick} />
          </>
        )}
        <Input
          key={FormNames.triggerAmount}
          label={copy.amount}
          labelColor="white"
          placeholder="0.0000"
          rightEl={<Pill text={assetMetadata.baseCurrency} />}
          control={control}
          name={FormNames.triggerAmount}
          rightLabel={
            <FormLabel mr={0} mb={0}>
              <Flex gap={1}>
                <Text fontSize="12px">{formatBig6(positionSize)}</Text>
                <Button
                  variant="text"
                  padding={0}
                  height="unset"
                  label={copy.max}
                  size="xs"
                  textDecoration="underline"
                  onClick={onClickMax}
                />
              </Flex>
            </FormLabel>
          }
          onChange={(e) => onChangeTriggerAmount(e.target.value)}
          validate={triggerAmountValidator}
        />
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
              onClick={() => resetForm()}
              aria-label={copy.reset}
            />
          )}
        </Flex>
        <Flex width="100%" height="100%" alignItems="flex-end">
          <TxButton
            type="submit"
            width="100%"
            isDisabled={disableTradeButton}
            label={copy.placeOrder}
            overrideLabel
            justifySelf="flex-end"
          />
        </Flex>
      </PaddedContainer>
    </Form>
  )
}

const IndexPriceLabel = ({ latestPrice }: { latestPrice: bigint }) => {
  const copy = useTradeFormCopy()
  return (
    <FormLabel mr={0} mb={0}>
      <Flex gap={1}>
        <Text fontSize="12px" variant="label">
          {copy.indexPrice}
        </Text>
        <Text fontSize="12px">{formatBig6USDPrice(latestPrice)}</Text>
      </Flex>
    </FormLabel>
  )
}
