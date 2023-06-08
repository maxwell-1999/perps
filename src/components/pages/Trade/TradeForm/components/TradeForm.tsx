import { ButtonGroup, Divider, Flex, FormLabel, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'

import Toggle from '@/components/shared/Toggle'
import { SupportedAsset } from '@/constants/assets'
import { OpenPositionType, OrderDirection } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { PositionDetails } from '@/hooks/markets'
import { useBalances } from '@/hooks/wallet'
import { Big18Math, formatBig18USDPrice } from '@/utils/big18Utils'
import { usePrevious } from '@/utils/hooks'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'
import { Slider } from '@ds/Slider'

import { IPerennialLens } from '@t/generated/LensAbi'

import { FormNames, OrderValues, formIds, orderDirections } from '../constants'
import { useOnChangeHandlers, useStyles, useTradeFormCopy } from '../hooks'
import { formatInitialInputs } from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import { TradeReceipt } from './Receipt'
import { Form } from './styles'

interface TradeFormProps {
  asset: SupportedAsset
  orderDirection: OrderDirection
  setOrderDirection: (orderDirection: OrderDirection) => void
  product: IPerennialLens.ProductSnapshotStructOutput
  position?: PositionDetails
}

function TradeForm(props: TradeFormProps) {
  const { orderDirection, setOrderDirection, product, position } = props
  const {
    productAddress,
    latestVersion: { price },
  } = product
  const prevProductAddress = usePrevious(productAddress)

  const { textColor, textBtnColor, textBtnHoverColor } = useStyles()
  const copy = useTradeFormCopy()
  const { data: balances } = useBalances()
  const { setTradeFormState } = useTradeFormState()
  const { address } = useAccount()
  const prevAddress = usePrevious(address)
  const { assetMetadata } = useMarketContext()
  const [orderValues, setOrderValues] = useState<OrderValues | null>(null)
  const [updating, setUpdating] = useState(false)
  const prevUpdating = usePrevious(updating)

  const hasPosition = !!position?.nextPosition && !!address
  const positionOrderDirection = position?.direction
  const currentPositionAmount = position?.nextPosition ?? 0n
  const currentCollateral = position?.currentCollateral ?? 0n
  const isNewPosition = Big18Math.isZero(currentPositionAmount)

  const initialFormState = useMemo(
    () =>
      formatInitialInputs({
        userCollateral: currentCollateral,
        amount: currentPositionAmount,
        price,
        isNewPosition,
        isConnected: !!address,
      }),
    [currentCollateral, currentPositionAmount, price, isNewPosition, address],
  )

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { dirtyFields },
  } = useForm({
    defaultValues: initialFormState,
  })
  // TODO: check why this isn't picking up the change on collateral.
  // possibly because we're calling setValue rather than using the default onChange?
  const collateralHasInput = dirtyFields.collateral

  const collateral = watch(FormNames.collateral)
  const amount = watch(FormNames.amount)
  const leverage = watch(FormNames.leverage)

  const resetInputs = useCallback(() => {
    if (updating) return
    reset({ ...initialFormState, collateral: collateralHasInput ? collateral : initialFormState.collateral })
  }, [initialFormState, reset, updating, collateralHasInput, collateral])

  useEffect(() => {
    const userDisconnected = !address && !!prevAddress
    const userConnected = !!address && !prevAddress
    const changedProducts = productAddress !== prevProductAddress
    const userSwitchedAcct = address !== prevAddress
    const wasUpdating = prevUpdating && !updating

    const resetRequired = userConnected || userDisconnected || changedProducts || userSwitchedAcct || wasUpdating

    if (userConnected) {
      setUpdating(false)
    }
    if (resetRequired) {
      resetInputs()
    }
  }, [address, prevAddress, productAddress, prevProductAddress, collateral, prevUpdating, updating, resetInputs])

  const { onChangeAmount, onChangeLeverage, onChangeCollateral } = useOnChangeHandlers({
    setValue,
    leverageFixed: false,
    leverage,
    collateral,
    amount,
    price: product.latestVersion.price,
  })

  const onConfirm = (orderData: { collateral: string; amount: string }) => {
    setOrderValues(orderData)
  }

  const closeAdjustmentModal = () => {
    setOrderValues(null)
    setUpdating(false)
  }

  const cancelAdjustmentModal = () => {
    setOrderValues(null)
    reset()
  }

  return (
    <>
      {orderValues && (
        <AdjustPositionModal
          isOpen={!!orderValues}
          onClose={closeAdjustmentModal}
          onCancel={cancelAdjustmentModal}
          title={isNewPosition ? copy.confirmOrder : copy.confirmChanges}
          positionType={OpenPositionType.taker}
          asset={props.asset}
          position={position}
          product={product}
          orderValues={orderValues}
          usdcAllowance={balances?.usdcAllowance ?? 0n}
        />
      )}
      <Form onSubmit={handleSubmit(onConfirm)}>
        <Flex flexDirection="column" p="16px">
          <Flex justifyContent="space-between" mb="14px">
            <Text color={textColor}>{hasPosition ? copy.modifyPosition : copy.trade}</Text>
            {!!address && (
              <Button
                variant="text"
                label={copy.addCollateral}
                p={0}
                lineHeight={1}
                height="initial"
                fontSize="13px"
                color={textBtnColor}
                _hover={{ color: textBtnHoverColor }}
                onClick={() => setTradeFormState(FormState.close)}
              />
            )}
          </Flex>
          <Flex mb="14px">
            <Toggle<OrderDirection>
              labels={orderDirections}
              activeLabel={positionOrderDirection ? positionOrderDirection : orderDirection}
              onChange={setOrderDirection}
              overrideValue={positionOrderDirection}
            />
          </Flex>
          <Input
            type="number"
            id={formIds.collateral}
            key={formIds.collateral}
            labelText={copy.collateral}
            title={copy.collateral}
            placeholder="0.0000"
            rightLabel={
              <FormLabel mr={0} mb={0}>
                <Text variant="label">
                  {formatBig18USDPrice(balances?.usdc, { fromUsdc: true }) ?? copy.zeroUsd} {copy.max}
                </Text>
              </FormLabel>
            }
            rightEl={<Pill text={assetMetadata.quoteCurrency} />}
            mb="12px"
            control={control}
            name={FormNames.collateral}
            onChange={(e) => onChangeCollateral(e.target.value)}
          />
          <Input
            type="number"
            key={formIds.amount}
            id={formIds.amount}
            labelText={copy.amount}
            placeholder="0.0000"
            rightLabel={
              <FormLabel mr={0} mb={0}>
                <Text variant="label">{copy.max}</Text>
              </FormLabel>
            }
            rightEl={<Pill text={assetMetadata.baseCurrency} />}
            mb="12px"
            control={control}
            name={FormNames.amount}
            onChange={(e) => onChangeAmount(e.target.value)}
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
            onChange={onChangeLeverage}
          />
        </Flex>
        <Divider mt="auto" />
        <Flex flexDirection="column" p="16px">
          <TradeReceipt mb="25px" px="3px" />
          {hasPosition ? (
            <ButtonGroup>
              <Button variant="transparent" label={copy.close} onClick={() => setTradeFormState(FormState.close)} />
              <Button flex={1} label={copy.modifyPosition} type="submit" />
            </ButtonGroup>
          ) : (
            <Button type="submit" isDisabled={!address} label={address ? copy.placeTrade : copy.connectWallet} />
          )}
        </Flex>
      </Form>
    </>
  )
}

export default TradeForm
