import { Box, Flex, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Control, FieldError, FieldErrors, UseFormResetField, Validate } from 'react-hook-form'

import { Container } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import { AssetMetadata, PositionSide2, SupportedAsset, TriggerComparison } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { useChainLivePrices2 } from '@/hooks/markets2'
import { Big6Math, formatBig6 } from '@/utils/big6Utils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'

import { FormNames, OrderTypes } from '../../constants'
import { TradeFormValues, useTradeFormCopy } from '../../hooks'
import { stopLossPercents, takeProfitPercents } from './constants'
import { calcTriggerOrderPrice } from './hooks'

interface LimitOrderProps {
  validate?: Validate<any, any> | Record<string, Validate<any, any>> | undefined
  onChange: (value: string) => void
  onChangePercent: (value: string) => void
  control: Control<any>
  rightEl: React.ReactNode
  error?: FieldError
  hasPosition?: boolean
  selectedLimitComparison: TriggerComparison
  setSelectedLimitComparison: (option: TriggerComparison) => void
  latestPrice: bigint
  limitPrice: string
}

export const LimitOrderInput = ({
  validate,
  control,
  onChange,
  onChangePercent,
  rightEl,
  error,
  hasPosition,
  selectedLimitComparison,
  latestPrice,
  limitPrice,
  setSelectedLimitComparison,
}: LimitOrderProps) => {
  const copy = useTradeFormCopy()
  const { selectedMarket } = useMarketContext()
  const livePrices = useChainLivePrices2()
  const currentPrice = Big6Math.toUnsafeFloat(livePrices[selectedMarket] ?? latestPrice)
  const willExecuteAsMarketOrder =
    selectedLimitComparison === TriggerComparison.lte
      ? currentPrice * 1.01 <= Number(limitPrice)
      : currentPrice * 0.99 >= Number(limitPrice)

  return (
    <Flex flexDirection="column">
      <Flex alignItems="center" gap={2}>
        <Input
          key={FormNames.limitPrice}
          label={copy.limitPrice}
          labelColor="white"
          placeholder="0.0000"
          rightEl={rightEl}
          control={control}
          name={FormNames.limitPrice}
          hideFieldError
          onChange={(e) => onChange(e.target.value)}
          validate={validate}
        />
        <Input
          width="140px"
          placeholder="0.0"
          key={FormNames.limitPricePercent}
          label={<Box height="18px" />}
          rightEl={<Text mr={2}>{copy.percent}</Text>}
          name={FormNames.limitPricePercent}
          control={control}
          onChange={(e) => onChangePercent(e.target.value)}
          pl={2}
          pr={6}
          rightLabel={
            hasPosition && (
              <ComparisonSelector
                onClick={setSelectedLimitComparison}
                selectedTriggerComparison={selectedLimitComparison}
              />
            )
          }
        />
      </Flex>
      {error?.message && (
        <Text fontSize="11px" color="red.300" pl={1} pt={2}>
          {error.message}
        </Text>
      )}
      {willExecuteAsMarketOrder && (
        <Text fontSize="11px" color="red.300" pl={1} pt={2}>
          {copy.executeAsMarketOrder}
        </Text>
      )}
    </Flex>
  )
}

interface TriggerOrderProps {
  validateStopLoss: Validate<any, any> | Record<string, Validate<any, any>> | undefined
  validateTakeProfit: Validate<any, any> | Record<string, Validate<any, any>> | undefined
  onChangeStopLoss: (value: string) => void
  onChangeTakeProfit: (value: string) => void
  control: Control<any>
  rightEl: React.ReactNode
  latestPrice: bigint
  errors: FieldErrors<TradeFormValues>
  resetField: UseFormResetField<TradeFormValues>
  isFormDirty: boolean
  orderDirection: PositionSide2.long | PositionSide2.short
  amount?: string
  collateral?: string
  isLimit: boolean
}

export const TriggerOrderInputGroup = ({
  validateStopLoss,
  validateTakeProfit,
  onChangeStopLoss,
  onChangeTakeProfit,
  latestPrice,
  control,
  errors,
  resetField,
  orderDirection,
  isFormDirty,
  amount,
  collateral,
  isLimit,
}: TriggerOrderProps) => {
  const copy = useTradeFormCopy()

  return (
    <Flex flexDirection="column" gap="13px">
      <TriggerOrderInput
        name={FormNames.stopLoss}
        label={copy.stopLoss}
        validate={validateStopLoss}
        onChange={onChangeStopLoss}
        latestPrice={latestPrice}
        control={control}
        percentValues={stopLossPercents}
        error={errors?.[FormNames.stopLoss]}
        resetField={resetField}
        isFormDirty={isFormDirty}
        amount={amount}
        collateral={collateral}
        orderDirection={orderDirection}
        isLimit={isLimit}
      />
      <TriggerOrderInput
        name={FormNames.takeProfit}
        label={copy.takeProfit}
        validate={validateTakeProfit}
        onChange={onChangeTakeProfit}
        latestPrice={latestPrice}
        control={control}
        percentValues={takeProfitPercents}
        error={errors?.[FormNames.takeProfit]}
        resetField={resetField}
        isFormDirty={isFormDirty}
        amount={amount}
        collateral={collateral}
        orderDirection={orderDirection}
        isLimit={isLimit}
      />
    </Flex>
  )
}

interface TriggerOrderInputProps {
  validate: Validate<any, any> | Record<string, Validate<any, any>> | undefined
  onChange: (value: string) => void
  name: FormNames
  control: Control<any>
  label: string
  percentValues: string[]
  latestPrice: bigint
  error?: FieldError
  resetField: UseFormResetField<TradeFormValues>
  isFormDirty: boolean
  amount?: string
  collateral?: string
  orderDirection: PositionSide2.long | PositionSide2.short
  isLimit: boolean
}

const TriggerOrderInput = ({
  validate,
  control,
  onChange,
  name,
  label,
  percentValues,
  latestPrice,
  resetField,
  error,
  isFormDirty,
  amount,
  collateral,
  orderDirection,
  isLimit,
}: TriggerOrderInputProps) => {
  const [showInput, setShowInput] = useState(false)
  const [percentChange, setPercentChange] = useState('0')
  const copy = useTradeFormCopy()
  const { selectedMarket } = useMarketContext()
  const livePrices = useChainLivePrices2()
  const indexPrice = livePrices[selectedMarket] ?? latestPrice ?? 0n

  useEffect(() => {
    if (!isFormDirty) {
      setPercentChange('0')
    }
  }, [isFormDirty, setPercentChange])

  if (!showInput) {
    return <OptionalInputButton onClick={() => setShowInput(true)} label={label} />
  }

  const onPercentClick = (percent: string) => {
    if (!amount || !collateral) {
      const priceAsFloat = Big6Math.toUnsafeFloat(indexPrice)
      const newAmount =
        Big6Math.toUnsafeFloat(isLimit && latestPrice ? latestPrice : indexPrice) * (Number(percent) / 100)
      const newValue = priceAsFloat + newAmount
      onChange(`${newValue}`)
      setPercentChange(percent)
    } else {
      const triggerPrices = calcTriggerOrderPrice({
        positionSize: Big6Math.fromFloatString(amount ?? '0'),
        collateral: Big6Math.fromFloatString(collateral ?? '0'),
        orderType: name === FormNames.stopLoss ? OrderTypes.stopLoss : OrderTypes.takeProfit,
        percent,
        orderDirection,
        latestPrice: isLimit && latestPrice ? latestPrice : indexPrice,
      })

      const percentFromIndex =
        ((triggerPrices.triggerPrice - Big6Math.toUnsafeFloat(indexPrice)) / Big6Math.toUnsafeFloat(indexPrice)) * 100
      onChange(`${triggerPrices.triggerPrice}`)
      setPercentChange(`${Math.trunc(percentFromIndex)}`)
    }
  }

  return (
    <Container bg="transparent" p={2} gap={2}>
      <Flex alignItems="center">
        <Text variant="label" whiteSpace="nowrap" mr={2}>
          {label}
        </Text>
        <Container
          minHeight="44px"
          flexDirection="row"
          alignItems="center"
          pl={2}
          pr={1}
          borderColor={error ? 'red.300' : colors.brand.whiteAlpha[10]}
        >
          <Flex flexDirection="column" height="100%" flex={1}>
            <Input
              variant="trigger"
              height="50%"
              placeholder="0.0"
              labelColor="white"
              key={name}
              name={name}
              control={control}
              onChange={(e) => {
                const { value } = e.target
                onChange(value)
                const inputValueAsFloat = parseFloat(value)
                const latestPriceAsFloat = Big6Math.toUnsafeFloat(indexPrice)
                const percentChangeValue = ((inputValueAsFloat - latestPriceAsFloat) / latestPriceAsFloat) * 100
                setPercentChange(isNaN(percentChangeValue) ? '0' : percentChangeValue.toFixed(2))
              }}
              validate={validate}
              hideFieldError
            />
            <Text variant="label">{copy.fromIndex(`${percentChange}`)}</Text>
          </Flex>
          <Button
            p={0}
            variant="text"
            fontSize="12px"
            onClick={() => {
              resetField(name as FormNames.stopLoss | FormNames.takeProfit)
              setPercentChange('0')
              setShowInput(false)
            }}
            label={
              <Text color={colors.brand.red} fontSize="12px">
                {copy.clear}
              </Text>
            }
          />
        </Container>
      </Flex>
      {error?.message && (
        <Text fontSize="11px" color="red.300" pl={1}>
          {error.message}
        </Text>
      )}
      <PercentValueShortcuts percentValues={percentValues} onPercentClick={onPercentClick} />
    </Container>
  )
}

const OptionalInputButton = ({ onClick, label }: { onClick: () => void; label: string }) => {
  const copy = useTradeFormCopy()
  return (
    <Button
      height="22px"
      px={2}
      variant="outline"
      onClick={onClick}
      label={
        <Flex alignItems="center" width="100%" justifyContent="space-between">
          <Text fontSize="12px" variant="label">
            {label}
          </Text>
          <Text fontSize="12px" color={colors.brand.purple[240]}>
            {copy.add}
          </Text>
        </Flex>
      }
    />
  )
}

export const PositionDisplay = ({
  position,
  asset,
  orderDirection,
}: {
  position: bigint
  asset: SupportedAsset
  orderDirection: PositionSide2.long | PositionSide2.short
}) => {
  const copy = useTradeFormCopy()
  const market = AssetMetadata[asset]
  const directionColor = orderDirection === PositionSide2.long ? colors.brand.green : colors.brand.red
  return (
    <Flex flexDirection="column" gap={2}>
      <Text variant="label" color="white">
        {copy.position}
      </Text>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        height="44px"
        gap={2}
        border={`1px solid ${colors.brand.whiteAlpha[10]}`}
        borderRadius="5px"
        p={2}
      >
        <Flex gap={3}>
          <Box minHeight="22px" minWidth="22px">
            <Image src={market.icon} height={22} width={22} alt={market.name} />
          </Box>
          <Text>{formatBig6(position)}</Text>
          <Pill text={asset} />
        </Flex>
        <Text textTransform="capitalize" color={directionColor}>
          {orderDirection}
        </Text>
      </Flex>
    </Flex>
  )
}

export const PercentValueShortcuts = ({
  percentValues,
  onPercentClick,
}: {
  percentValues: string[]
  onPercentClick: (percent: string) => void
}) => {
  return (
    <Flex>
      {percentValues.map((value, index) => (
        <Button
          height="28px"
          variant="transparent"
          fontSize="12px"
          flex={1}
          bg="transparent"
          key={value}
          color={colors.brand.whiteAlpha[50]}
          // eslint-disable-next-line formatjs/no-literal-string-in-jsx
          label={`${Number(value) > 0 ? '+' : ''}${value}%`}
          mr={index === percentValues.length - 1 ? '0' : '8px'}
          onClick={() => {
            onPercentClick(value)
          }}
        />
      ))}
    </Flex>
  )
}

const ComparisonSelector = ({
  selectedTriggerComparison,
  onClick,
}: {
  selectedTriggerComparison: TriggerComparison
  onClick: (option: TriggerComparison) => void
}) => {
  const labels = useTradeFormCopy().comparisonLabels
  const options = Object.keys(TriggerComparison) as TriggerComparison[]
  return (
    <Menu gutter={0}>
      {({ isOpen }) => (
        <>
          <MenuButton
            fontSize="11px"
            borderRadius="5px"
            borderBottomLeftRadius={isOpen ? '0' : '5px'}
            borderBottomRightRadius={isOpen ? '0' : '5px'}
            border={`1px solid ${colors.brand.whiteAlpha[30]}`}
            p={0}
            px={1}
            height="fit-content"
            type="button"
          >
            <Flex alignItems="center" gap={1}>
              {labels[selectedTriggerComparison]}
            </Flex>
          </MenuButton>
          <MenuList p={0} minWidth="30px" border={`1px solid ${colors.brand.whiteAlpha[30]}`} borderRadius="0">
            {options.map((option) => {
              return (
                <MenuItem
                  key={option}
                  onClick={() => {
                    onClick(option)
                  }}
                  py="2px"
                  pl="6px"
                  fontSize="11px"
                  color={colors.brand.whiteAlpha[70]}
                  bg={'black'}
                  _hover={{ color: 'white' }}
                  borderBottom={`1px solid ${colors.brand.whiteAlpha[10]}`}
                  _last={{ borderBottom: 'none', borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' }}
                >
                  {labels[option]}
                </MenuItem>
              )
            })}
          </MenuList>
        </>
      )}
    </Menu>
  )
}
