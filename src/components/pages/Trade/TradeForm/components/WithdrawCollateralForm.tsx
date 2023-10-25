import { ButtonGroup, Divider, Flex, FormLabel, Text } from '@chakra-ui/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { TxButton } from '@/components/shared/TxButton'
import { FormattedBig6USDPrice } from '@/components/shared/components'
import { Form } from '@/components/shared/components'
import { PositionSide2, SupportedAsset } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { MarketSnapshot, UserMarketSnapshot } from '@/hooks/markets2'
import { useChainId } from '@/hooks/network'
import { Big6Math } from '@/utils/big6Utils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'

import { FormNames, OrderValues, buttonPercentValues } from '../constants'
import { useOnChangeHandlers, useStyles, useTradeFormCopy } from '../hooks'
import { isFullClose } from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import { TradeReceipt } from './Receipt'
import { FormOverlayHeader } from './styles'
import { useCloseCollateralValidator } from './validatorHooks'

interface WithdrawCollateralFormProps {
  asset: SupportedAsset
  position: UserMarketSnapshot
  product: MarketSnapshot
}

function WithdrawCollateralForm({ position, product, asset }: WithdrawCollateralFormProps) {
  const chainId = useChainId()
  const formRef = useRef<HTMLFormElement>(null)
  const { setTradeFormState } = useTradeFormState()
  const { assetMetadata, orderDirection, isMaker } = useMarketContext()
  const copy = useTradeFormCopy()
  const { percentBtnBg } = useStyles()
  const [orderValues, setOrderValues] = useState<OrderValues | null>(null)

  const {
    nextMagnitude,
    nextLeverage,
    local: { collateral: currentCollateral },
  } = position

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

  const { onChangeCollateral: collateralChangeHandler } = useOnChangeHandlers({
    setValue,
    leverage,
    collateral,
    amount,
    leverageFixed: false,
    currentPosition: Big6Math.fromFloatString(amount),
    marketSnapshot: product,
    chainId,
    positionStatus: position.status,
    direction: isMaker ? PositionSide2.maker : orderDirection,
    latestPrice: product.global.latestPrice,
  })

  // Setup values based on variant

  const onPerecentClick = useCallback(
    (percent: number) => {
      const newAmount = ((currentCollateral ?? 0n) * BigInt(percent)) / 100n
      collateralChangeHandler(Big6Math.toFloatString(newAmount))
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
      collateralDelta: -Big6Math.fromFloatString(collateral),
      positionDelta: -Big6Math.fromFloatString(amount),
      fullClose: isFullClose(amount, nextMagnitude ?? 0n),
    }
  }, [collateral, amount, nextMagnitude])

  const onConfirm = (orderData: { collateral: string; amount: string }) => {
    const fullClose = isFullClose(orderData.amount, nextMagnitude ?? 0n)

    setOrderValues({
      collateral: Big6Math.toFloatString(
        fullClose ? 0n : Big6Math.sub(currentCollateral, Big6Math.fromFloatString(orderData.collateral)),
      ),
      amount: Big6Math.toFloatString(Big6Math.sub(nextMagnitude ?? 0n, Big6Math.fromFloatString(orderData.amount))),
      fullClose,
    })
  }

  const hasFormErrors = Object.keys(errors).length > 0
  const disableWithdrawBtn = (!positionDelta.positionDelta && !positionDelta.collateralDelta) || hasFormErrors

  const collateralValidator = useCloseCollateralValidator({
    requiredMaintenance: position.maintenance ?? 0n,
    minCollateral: (product.riskParameter.minMargin ?? 0n) * 2n,
    currentCollateral: currentCollateral ?? 0n,
    nextPosition: nextMagnitude ?? 0n,
  })

  return (
    <>
      {orderValues && (
        <AdjustPositionModal
          isOpen={!!orderValues}
          onClose={closeAdjustmentModal}
          onCancel={cancelAdjustmentModal}
          title={copy.withdrawCollateral}
          positionSide={position.side}
          asset={asset}
          position={position}
          market={product}
          orderValues={orderValues}
          usdcAllowance={0n}
          variant="withdraw"
        />
      )}
      <Form onSubmit={handleSubmit(onConfirm)} ref={formRef}>
        <FormOverlayHeader title={copy.withdrawCollateral} onClose={() => setTradeFormState(FormState.trade)} />
        <Flex flexDirection="column" px="16px" mb="12px" gap="12px">
          <Input
            name={FormNames.collateral}
            label={copy.collateral}
            placeholder="0.0000"
            rightLabel={
              <FormLabel mr={0} mb={0}>
                <Text variant="label">
                  <FormattedBig6USDPrice value={currentCollateral ?? 0n} as="span" />
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
              formRef={formRef}
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
