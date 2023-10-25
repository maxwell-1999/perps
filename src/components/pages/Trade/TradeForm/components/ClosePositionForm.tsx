import { ButtonGroup, Divider, Flex, FormLabel, Text } from '@chakra-ui/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { TxButton } from '@/components/shared/TxButton'
import { Form, FormattedBig6 } from '@/components/shared/components'
import { PositionSide2, SupportedAsset } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { MarketSnapshot, UserMarketSnapshot } from '@/hooks/markets2'
import { useChainId } from '@/hooks/network'
import { useBalances } from '@/hooks/wallet'
import { Big6Math } from '@/utils/big6Utils'
import { isFailedClose } from '@/utils/positionUtils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'

import { FormNames, OrderValues, buttonPercentValues } from '../constants'
import { useOnChangeHandlers, useStyles, useTradeFormCopy } from '../hooks'
import { isFullClose } from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import { TradeReceipt } from './Receipt'
import { FormOverlayHeader } from './styles'
import { useCloseAmountValidator } from './validatorHooks'

interface ClosePositionFormProps {
  asset: SupportedAsset
  position: UserMarketSnapshot
  product: MarketSnapshot
}

function ClosePositionForm({ position, product, asset }: ClosePositionFormProps) {
  const chainId = useChainId()
  const formRef = useRef<HTMLFormElement>(null)

  const { setTradeFormState } = useTradeFormState()
  const { assetMetadata, orderDirection, isMaker } = useMarketContext()
  const copy = useTradeFormCopy()
  const { percentBtnBg } = useStyles()
  const [orderValues, setOrderValues] = useState<OrderValues | null>(null)
  const { data: balances } = useBalances()

  const {
    parameter: { closed },
  } = product
  const {
    magnitude,
    nextMagnitude,
    nextLeverage,
    local: { collateral: currentCollateral },
  } = position

  const failedClose = isFailedClose(position)

  const magnitudeForForm = failedClose ? magnitude : nextMagnitude

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      [FormNames.amount]: '',
      [FormNames.collateral]: '',
      [FormNames.leverage]: Big6Math.toFloatString(nextLeverage ?? 0n),
      [FormNames.limitPrice]: '',
      [FormNames.limitPricePercent]: '',
      [FormNames.stopLoss]: '',
      [FormNames.takeProfit]: '',
    },
  })
  const amount = watch(FormNames.amount)
  const collateral = watch(FormNames.collateral)
  const leverage = watch(FormNames.leverage)

  const { onChangeAmount: amountChangeHandler } = useOnChangeHandlers({
    setValue,
    leverage,
    collateral,
    amount,
    currentPosition: magnitudeForForm,
    leverageFixed: true,
    marketSnapshot: product,
    chainId,
    positionStatus: position.status,
    direction: isMaker ? PositionSide2.maker : orderDirection,
    latestPrice: product.global.latestPrice,
  })

  const onPerecentClick = useCallback(
    (percent: number) => {
      const newAmount = ((magnitudeForForm ?? 0n) * BigInt(percent)) / 100n
      amountChangeHandler(Big6Math.toFloatString(newAmount))
    },
    [magnitudeForForm, amountChangeHandler],
  )

  const onChangeAmount = (value: string) => {
    amountChangeHandler(value)
  }

  const closeAdjustmentModal = () => {
    setOrderValues(null)
    setTradeFormState(FormState.trade)
  }

  const cancelAdjustmentModal = () => {
    setOrderValues(null)
    setTradeFormState(FormState.trade)
  }

  const positionDelta = useMemo(() => {
    return {
      collateralDelta: -Big6Math.fromFloatString(collateral),
      positionDelta: -Big6Math.fromFloatString(amount),
      fullClose: isFullClose(amount, magnitudeForForm ?? 0n),
    }
  }, [collateral, amount, magnitudeForForm])

  const onConfirm = (orderData: { collateral: string; amount: string }) => {
    const fullClose = isFullClose(orderData.amount, magnitudeForForm ?? 0n)

    setOrderValues({
      collateral: Big6Math.toFloatString(
        fullClose ? 0n : Big6Math.sub(currentCollateral, Big6Math.fromFloatString(orderData.collateral)),
      ),
      amount: Big6Math.toFloatString(Big6Math.sub(magnitudeForForm ?? 0n, Big6Math.fromFloatString(orderData.amount))),
      fullClose,
    })
  }

  const hasFormErrors = Object.keys(errors).length > 0
  const disableCloseBtn = (!positionDelta.positionDelta && !positionDelta.collateralDelta) || hasFormErrors

  const amountValidator = useCloseAmountValidator({
    currentPositionAmount: magnitudeForForm ?? 0n,
    isMaker,
    liquidity: product.nextPosition.maker + product.nextMinor,
    maker: product.nextPosition.maker,
    major: product.nextMajor,
    marketClosed: closed,
    efficiencyLimit: product.riskParameter.efficiencyLimit,
  })

  return (
    <>
      {orderValues && (
        <AdjustPositionModal
          isOpen={!!orderValues}
          onClose={closeAdjustmentModal}
          onCancel={cancelAdjustmentModal}
          title={copy.closePosition}
          positionSide={position.side}
          asset={asset}
          position={position}
          market={product}
          orderValues={orderValues}
          positionDelta={positionDelta.positionDelta}
          usdcAllowance={balances?.usdcAllowance ?? 0n}
          variant="close"
        />
      )}
      <Form onSubmit={handleSubmit(onConfirm)} ref={formRef}>
        <FormOverlayHeader title={copy.closePosition} onClose={() => setTradeFormState(FormState.trade)} />
        <Flex flexDirection="column" px="16px" mb="12px" gap="12px">
          <Input
            name={FormNames.amount}
            label={copy.amount}
            placeholder="0.0000"
            rightLabel={
              <FormLabel mr={0} mb={0}>
                <Text variant="label">
                  <FormattedBig6 value={magnitudeForForm ?? 0n} asset={position.asset} as="span" />
                </Text>
              </FormLabel>
            }
            control={control}
            onChange={(e) => onChangeAmount(e.target.value)}
            rightEl={<Pill text={assetMetadata.baseCurrency} />}
            validate={amountValidator}
          />
          <Flex justifyContent="space-between">
            {buttonPercentValues.map((value, index) => (
              <Button
                variant="transparent"
                fontSize="12px"
                bg={percentBtnBg}
                key={value}
                // eslint-disable-next-line formatjs/no-literal-string-in-jsx
                label={`${value}%`}
                mr={index === buttonPercentValues.length - 1 ? '0' : '8px'}
                onClick={() => {
                  onPerecentClick(value)
                }}
              />
            ))}
          </Flex>
        </Flex>
        <Divider mt="auto" />
        <Flex flexDirection="column" p="16px">
          <TradeReceipt
            mb="25px"
            px="3px"
            product={product}
            positionDetails={position}
            positionDelta={positionDelta}
            showCollateral
            showLeverage
          />
          <ButtonGroup>
            <Button label={copy.cancel} variant="transparent" onClick={() => setTradeFormState(FormState.trade)} />
            <TxButton
              formRef={formRef}
              flex={1}
              label={copy.closePosition}
              type="submit"
              isDisabled={disableCloseBtn}
              overrideLabel
              actionAllowedInGeoblock // allow closes in geoblock
            />
          </ButtonGroup>
        </Flex>
      </Form>
    </>
  )
}

export default ClosePositionForm
