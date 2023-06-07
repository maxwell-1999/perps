import { ButtonGroup, Divider, Flex, FormLabel, Text } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Slider } from '@/components/design-system'
import { FormattedBig18, FormattedBig18USDPrice } from '@/components/shared/components'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { PositionDetails } from '@/hooks/markets'
import { Big18Math } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'

import { IPerennialLens } from '@t/generated/LensAbi'

import { FormNames, buttonPercentValues } from '../constants'
import { useOnChangeHandlers, useStyles, useTradeFormCopy } from '../hooks'
import { calcPositionFee } from '../utils'
import { TradeReceipt } from './Receipt'
import { Form, FormOverlayHeader } from './styles'

interface ClosePositionFormProps {
  position: PositionDetails
  product: IPerennialLens.ProductSnapshotStructOutput
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

function ClosePositionForm({ position, product, onSubmit }: ClosePositionFormProps) {
  const { setTradeFormState } = useTradeFormState()
  const { assetMetadata } = useMarketContext()
  const copy = useTradeFormCopy()
  const { percentBtnBg } = useStyles()
  const [modifyingCollateral, setModifyingCollateral] = useState(false)

  const {
    productInfo: { takerFee },
    latestVersion: { price },
  } = product
  const { nextPosition, nextLeverage, currentCollateral } = position

  const { control, watch, setValue } = useForm({
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

  const closeFee = amount ? calcPositionFee(Big18Math.fromFloatString(amount), price, takerFee) : 0n
  // Amount of collateral received after close fee
  const collateralAfterFee = collateral ? Big18Math.sub(Big18Math.fromFloatString(collateral), closeFee) : undefined
  // Amount of position to close in order to receive the desired collateral
  const closeAmountAfterFee = collateral
    ? Big18Math.add(Big18Math.fromFloatString(amount), Big18Math.div(closeFee, price))
    : undefined

  return (
    <Form onSubmit={onSubmit}>
      <FormOverlayHeader title={copy.closePosition} onClose={() => setTradeFormState(FormState.trade)} />
      <Flex flexDirection="column" px="16px" mb="12px">
        <Input
          type="number"
          name={FormNames.amount}
          labelText={copy.amountToClose}
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
          type="number"
          name={FormNames.collateral}
          labelText={copy.youWillReceive}
          placeholder="0.0000"
          value={
            modifyingCollateral ? collateral : collateralAfterFee ? Big18Math.toFloatString(collateralAfterFee) : ''
          }
          control={control}
          rightEl={<Pill text={assetMetadata.quoteCurrency} />}
          rightLabel={
            <FormLabel mr={0} mb={0}>
              <Text variant="label">
                <FormattedBig18USDPrice value={currentCollateral ?? 0n} as="span" mr={1} />
                {copy.max}
              </Text>
            </FormLabel>
          }
          onChange={(e) => onChangeCollateral(e.target.value)}
          mb="12px"
        />
        {/* Default slider til we get designs */}
        <Slider
          label={copy.leverage}
          ariaLabel="leverage-slider"
          min={0}
          max={20}
          step={0.1}
          containerProps={{
            mb: 2,
          }}
          focusThumbOnChange={false}
          control={control}
          name={FormNames.leverage}
          isDisabled
        />
      </Flex>
      <Divider mt="auto" />
      <Flex flexDirection="column" p="16px">
        <TradeReceipt mb="25px" px="3px" hideEntry />
        <ButtonGroup>
          <Button label={copy.cancel} variant="transparent" onClick={() => setTradeFormState(FormState.trade)} />
          <Button flex={1} label={copy.closePosition} type="submit" />
        </ButtonGroup>
      </Flex>
    </Form>
  )
}

export default ClosePositionForm
