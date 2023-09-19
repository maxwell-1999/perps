import { ButtonGroup, Divider, Flex, FormLabel, Text } from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { TxButton } from '@/components/shared/TxButton'
import { FormattedBig18USDPrice } from '@/components/shared/components'
import { Form } from '@/components/shared/components'
import { SupportedAsset } from '@/constants/assets'
import { OpenPositionType } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { PositionDetails, useProtocolSnapshot } from '@/hooks/markets'
import { Big18Math } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'

import { ProductSnapshot } from '@t/perennial'

import { FormNames, OrderValues, buttonPercentValues } from '../constants'
import { useOnChangeHandlers, useStyles, useTradeFormCopy } from '../hooks'
import { isFullClose } from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import { TradeReceipt } from './Receipt'
import { FormOverlayHeader } from './styles'
import { useCloseCollateralValidator } from './validatorHooks'

interface WithdrawCollateralFormProps {
  asset: SupportedAsset
  position: PositionDetails
  product: ProductSnapshot
}

function WithdrawCollateralForm({ position, product, asset }: WithdrawCollateralFormProps) {
  const { setTradeFormState } = useTradeFormState()
  const { assetMetadata, isMaker } = useMarketContext()
  const copy = useTradeFormCopy()
  const { percentBtnBg } = useStyles()
  const [orderValues, setOrderValues] = useState<OrderValues | null>(null)
  const { data: protocolSnapshot } = useProtocolSnapshot()

  const {
    latestVersion: { price },
  } = product
  const { nextPosition, nextLeverage, currentCollateral } = position

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      [FormNames.amount]: '',
      [FormNames.collateral]: '',
      [FormNames.leverage]: Big18Math.toFloatString(nextLeverage ?? 0n),
    },
  })
  const amount = watch(FormNames.amount)
  const collateral = watch(FormNames.collateral)
  const leverage = watch(FormNames.leverage)

  const { onChangeCollateral: collateralChangeHandler } = useOnChangeHandlers({
    setValue,
    leverage,
    collateral,
    amount,
    price,
    leverageFixed: false,
  })

  // Setup values based on variant

  const onPerecentClick = useCallback(
    (percent: number) => {
      const newAmount = ((currentCollateral ?? 0n) * BigInt(percent)) / 100n
      collateralChangeHandler(Big18Math.toFloatString(newAmount))
    },
    [currentCollateral, collateralChangeHandler],
  )

  const onChangeAmount = (value: string) => {
    collateralChangeHandler(value)
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
      collateralDelta: -Big18Math.fromFloatString(collateral),
      positionDelta: -Big18Math.fromFloatString(amount),
      fullClose: isFullClose(amount, nextPosition ?? 0n),
    }
  }, [collateral, amount, nextPosition])

  const onConfirm = (orderData: { collateral: string; amount: string }) => {
    const fullClose = isFullClose(orderData.amount, nextPosition ?? 0n)

    setOrderValues({
      collateral: Big18Math.toFloatString(
        fullClose ? 0n : Big18Math.sub(currentCollateral, Big18Math.fromFloatString(orderData.collateral)),
      ),
      amount: Big18Math.toFloatString(Big18Math.sub(nextPosition ?? 0n, Big18Math.fromFloatString(orderData.amount))),
      fullClose,
    })
    reset()
  }

  const hasFormErrors = Object.keys(errors).length > 0
  const disableWithdrawBtn = (!positionDelta.positionDelta && !positionDelta.collateralDelta) || hasFormErrors

  const collateralValidator = useCloseCollateralValidator({
    requiredMaintenance: position.maintenance ?? 0n,
    minCollateral: protocolSnapshot?.minCollateral ?? 0n,
    currentCollateral: currentCollateral ?? 0n,
    nextPosition: nextPosition ?? 0n,
  })

  return (
    <>
      {orderValues && (
        <AdjustPositionModal
          isOpen={!!orderValues}
          onClose={closeAdjustmentModal}
          onCancel={cancelAdjustmentModal}
          title={copy.withdrawCollateral}
          positionType={isMaker ? OpenPositionType.maker : OpenPositionType.taker}
          asset={asset}
          position={position}
          product={product}
          orderValues={orderValues}
          usdcAllowance={0n}
          variant="withdraw"
          leverage={leverage}
        />
      )}
      <Form onSubmit={handleSubmit(onConfirm)}>
        <FormOverlayHeader title={copy.withdrawCollateral} onClose={() => setTradeFormState(FormState.trade)} />
        <Flex flexDirection="column" px="16px" mb="12px" gap="12px">
          <Input
            name={FormNames.collateral}
            label={copy.collateral}
            placeholder="0.0000"
            rightLabel={
              <FormLabel mr={0} mb={0}>
                <Text variant="label">
                  <FormattedBig18USDPrice value={currentCollateral ?? 0n} as="span" />
                </Text>
              </FormLabel>
            }
            control={control}
            onChange={(e) => onChangeAmount(e.target.value)}
            rightEl={<Pill text={assetMetadata.quoteCurrency} />}
            validate={collateralValidator}
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
              flex={1}
              label={copy.withdrawCollateral}
              type="submit"
              isDisabled={disableWithdrawBtn}
              overrideLabel
              actionAllowedInGeoblock // allow collateral withdrawal in geoblock
            />
          </ButtonGroup>
        </Flex>
      </Form>
    </>
  )
}

export default WithdrawCollateralForm
