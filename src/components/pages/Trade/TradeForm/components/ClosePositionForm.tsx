import { ButtonGroup, Divider, Flex, FormLabel, Text } from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Slider } from '@/components/design-system'
import { FormattedBig18, FormattedBig18USDPrice } from '@/components/shared/components'
import { SupportedAsset } from '@/constants/assets'
import { OpenPositionType } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { PositionDetails, useProtocolSnapshot } from '@/hooks/markets'
import { Big18Math } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'

import { IPerennialLens } from '@t/generated/LensAbi'

import { FormNames, OrderValues, buttonPercentValues } from '../constants'
import { useOnChangeHandlers, useStyles, useTradeFormCopy } from '../hooks'
import { calcPositionFee } from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import { TradeReceipt } from './Receipt'
import { Form, FormOverlayHeader } from './styles'
import { useCloseAmountValidator, useCloseCollateralValidator } from './validatorHooks'

interface ClosePositionFormProps {
  asset: SupportedAsset
  position: PositionDetails
  product: IPerennialLens.ProductSnapshotStructOutput
}

function ClosePositionForm({ position, product, asset }: ClosePositionFormProps) {
  const { setTradeFormState } = useTradeFormState()
  const { assetMetadata } = useMarketContext()
  const copy = useTradeFormCopy()
  const { percentBtnBg } = useStyles()
  const [orderValues, setOrderValues] = useState<OrderValues | null>(null)
  const [modifyingCollateral, setModifyingCollateral] = useState(false)
  const { data: protocolSnapshot } = useProtocolSnapshot()

  const {
    productInfo: { takerFee },
    latestVersion: { price },
  } = product
  const { nextPosition, nextLeverage, currentCollateral } = position

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
      [FormNames.leverage]: parseFloat(Big18Math.toFloatString(nextLeverage ?? 0n)),
    },
  })
  const amount = watch(FormNames.amount)
  const collateral = watch(FormNames.collateral)
  const leverage = watch(FormNames.leverage)

  const { onChangeAmount: amountChangeHandler, onChangeCollateral: collateralChangeHandler } = useOnChangeHandlers({
    setValue,
    leverage,
    collateral,
    amount,
    price,
    leverageFixed: true,
  })

  const onPerecentClick = useCallback(
    (percent: number) => {
      const newAmount = ((nextPosition ?? 0n) * BigInt(percent)) / 100n
      setModifyingCollateral(false)
      amountChangeHandler(Big18Math.toFloatString(newAmount))
    },
    [nextPosition, amountChangeHandler],
  )

  const onChangeAmount = (value: string) => {
    setModifyingCollateral(false)
    amountChangeHandler(value)
  }

  const onChangeCollateral = (value: string) => {
    setModifyingCollateral(true)
    collateralChangeHandler(value)
  }

  const closeAdjustmentModal = () => {
    setOrderValues(null)
    setTradeFormState(FormState.trade)
  }

  const cancelAdjustmentModal = () => {
    setOrderValues(null)
  }

  const positionDelta = useMemo(() => {
    return {
      collateralDelta: -Big18Math.fromFloatString(collateral),
      positionDelta: -Big18Math.fromFloatString(amount),
    }
  }, [collateral, amount])

  const onConfirm = (orderData: { collateral: string; amount: string }) => {
    const fullClose = Big18Math.eq(Big18Math.fromFloatString(orderData.amount), nextPosition ?? 0n)

    setOrderValues({
      collateral: Big18Math.toFloatString(
        fullClose ? 0n : Big18Math.sub(currentCollateral, Big18Math.fromFloatString(orderData.collateral)),
      ),
      amount: Big18Math.toFloatString(Big18Math.sub(nextPosition ?? 0n, Big18Math.fromFloatString(orderData.amount))),
      fullClose,
    })
  }

  const maxCollateralToClose = (currentCollateral ?? 0n) - calcPositionFee(nextPosition ?? 0n, price, takerFee)
  const closeFee = amount ? calcPositionFee(Big18Math.fromFloatString(amount), price, takerFee) : 0n
  // Amount of collateral received after close fee
  const collateralAfterFee = collateral ? Big18Math.sub(Big18Math.fromFloatString(collateral), closeFee) : undefined
  // Amount of position to close in order to receive the desired collateral
  const closeAmountAfterFee = collateral
    ? Big18Math.add(Big18Math.fromFloatString(amount), Big18Math.div(closeFee, price))
    : undefined

  const hasFormErrors = Object.keys(errors).length > 0
  const disableCloseBtn = (!positionDelta.positionDelta && !positionDelta.collateralDelta) || hasFormErrors

  const amountValidator = useCloseAmountValidator({
    quantity: nextPosition ?? 0n,
  })

  const collateralValidator = useCloseCollateralValidator({
    currentCollateral: currentCollateral ?? 0n,
    minCollateral: protocolSnapshot?.minCollateral ?? 0n,
    nextPosition: nextPosition ?? 0n,
  })

  return (
    <>
      {orderValues && (
        <AdjustPositionModal
          isOpen={!!orderValues}
          onClose={closeAdjustmentModal}
          onCancel={cancelAdjustmentModal}
          title={copy.closePosition}
          positionType={OpenPositionType.taker}
          asset={asset}
          position={position}
          product={product}
          orderValues={orderValues}
          usdcAllowance={0n}
        />
      )}
      <Form onSubmit={handleSubmit(onConfirm)}>
        <FormOverlayHeader title={copy.closePosition} onClose={() => setTradeFormState(FormState.trade)} />
        <Flex flexDirection="column" px="16px" mb="12px">
          <Input
            name={FormNames.amount}
            labelText={copy.amount}
            placeholder="0.0000"
            value={
              modifyingCollateral ? (closeAmountAfterFee ? Big18Math.toFloatString(closeAmountAfterFee) : '') : amount
            }
            rightLabel={
              <FormLabel mr={0} mb={0}>
                <Text variant="label">
                  <FormattedBig18 value={nextPosition ?? 0n} asset={position.asset} as="span" /> {copy.max}
                </Text>
              </FormLabel>
            }
            control={control}
            onChange={(e) => onChangeAmount(e.target.value)}
            rightEl={<Pill text={assetMetadata.baseCurrency} />}
            mb="12px"
            validate={amountValidator}
            isRequired
          />
          <Flex mb="12px">
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
          <Input
            name={FormNames.collateral}
            labelText={copy.collateralAfterFees}
            placeholder="0.0000"
            value={
              modifyingCollateral ? collateral : collateralAfterFee ? Big18Math.toFloatString(collateralAfterFee) : ''
            }
            control={control}
            rightEl={<Pill text={assetMetadata.quoteCurrency} />}
            rightLabel={
              <FormLabel mr={0} mb={0}>
                <Text variant="label">
                  <FormattedBig18USDPrice value={maxCollateralToClose ?? 0n} as="span" mr={1} />
                  {copy.max}
                </Text>
              </FormLabel>
            }
            onChange={(e) => onChangeCollateral(e.target.value)}
            mb="12px"
            validate={collateralValidator}
            isRequired
          />
          <Slider
            label={copy.leverage}
            ariaLabel="leverage-slider"
            min={0}
            max={20}
            step={0.1}
            containerProps={{
              mb: 2,
            }}
            control={control}
            name={FormNames.leverage}
            isDisabled
          />
        </Flex>
        <Divider mt="auto" />
        <Flex flexDirection="column" p="16px">
          <TradeReceipt mb="25px" px="3px" product={product} positionDetails={position} positionDelta={positionDelta} />
          <ButtonGroup>
            <Button label={copy.cancel} variant="transparent" onClick={() => setTradeFormState(FormState.trade)} />
            <Button flex={1} label={copy.closePosition} type="submit" isDisabled={disableCloseBtn} />
          </ButtonGroup>
        </Flex>
      </Form>
    </>
  )
}

export default ClosePositionForm
