import { RepeatIcon } from '@chakra-ui/icons'
import { ButtonGroup, Divider, Flex, FormLabel, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import Toggle from '@/components/shared/Toggle'
import { TxButton } from '@/components/shared/TxButton'
import { FormattedBig18USDPrice } from '@/components/shared/components'
import { SupportedAsset } from '@/constants/assets'
import { OpenPositionType, OrderDirection, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { PositionDetails, useProtocolSnapshot } from '@/hooks/markets'
import { useAddress } from '@/hooks/network'
import { useBalances } from '@/hooks/wallet'
import { Big18Math, formatBig18USDPrice } from '@/utils/big18Utils'
import { usePrevious } from '@/utils/hooks'
import { next } from '@/utils/positionUtils'

import { Button, IconButton } from '@ds/Button'
import { Input, Pill } from '@ds/Input'
import { Slider } from '@ds/Slider'

import { IPerennialLens } from '@t/generated/LensAbi'

import { FormNames, OrderValues, orderDirections } from '../constants'
import { useOnChangeHandlers, useStyles, useTradeFormCopy } from '../hooks'
import { calcMaxLeverage, formatInitialInputs } from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import { TradeReceipt } from './Receipt'
import { Form } from './styles'
import { useCollateralValidators, useLeverageValidators, usePositionValidators } from './validatorHooks'

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
    maintenance,
    pre: globalPre,
  } = product

  const prevProductAddress = usePrevious(productAddress)

  const { textColor, textBtnColor, textBtnHoverColor } = useStyles()
  const copy = useTradeFormCopy()
  const { data: balances } = useBalances()
  const { data: protocolSnapshot } = useProtocolSnapshot()
  const { setTradeFormState } = useTradeFormState()
  const { address } = useAddress()
  const prevAddress = usePrevious(address)
  const { assetMetadata } = useMarketContext()
  const [orderValues, setOrderValues] = useState<OrderValues | null>(null)
  const positionStatus = position?.status ?? PositionStatus.resolved

  const hasPosition = positionStatus !== PositionStatus.resolved
  const positionOrderDirection = hasPosition ? position?.direction : undefined
  const currentPositionAmount = position?.nextPosition ?? 0n
  const currentCollateral = position?.currentCollateral ?? 0n
  const isNewPosition = Big18Math.isZero(currentPositionAmount)
  const maxLeverage = useMemo(() => calcMaxLeverage(maintenance), [maintenance])
  const userMaintenance = position?.maintenance ?? 0n

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
    formState: { dirtyFields, errors },
  } = useForm({
    defaultValues: initialFormState,
  })

  const collateralHasInput = dirtyFields.collateral

  const collateral = watch(FormNames.collateral)
  const amount = watch(FormNames.amount)
  const leverage = watch(FormNames.leverage)

  const resetInputs = useCallback(() => {
    reset({ ...initialFormState })
  }, [initialFormState, reset])

  useEffect(() => {
    const userDisconnected = !address && !!prevAddress
    const userConnected = !!address && !prevAddress
    const changedProducts = productAddress !== prevProductAddress
    const userSwitchedAcct = address !== prevAddress

    const resetRequired = userConnected || userDisconnected || changedProducts || userSwitchedAcct

    if (resetRequired) {
      resetInputs()
    }

    const collateralChanged = initialFormState.collateral !== collateral
    if (!collateralHasInput && collateralChanged) {
      setValue(FormNames.collateral, initialFormState.collateral, { shouldValidate: true })
    }
  }, [
    address,
    prevAddress,
    productAddress,
    prevProductAddress,
    collateralHasInput,
    initialFormState.collateral,
    collateral,
    setValue,
    resetInputs,
  ])

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

  const onWithdrawCollateral = () => {
    onChangeCollateral('0')
    setOrderValues({ collateral: '0', amount: '0' })
  }

  const closeAdjustmentModal = () => {
    setOrderValues(null)
  }

  const cancelAdjustmentModal = () => {
    setOrderValues(null)
    reset()
  }

  const onClickMaxCollateral = () => {
    onChangeCollateral(Big18Math.toFloatString(currentCollateral + Big18Math.fromDecimals(balances?.usdc ?? 0n, 6)))
  }

  const positionDelta = useMemo(
    () => ({
      collateralDelta: Big18Math.fromFloatString(collateral) - currentCollateral,
      positionDelta: Big18Math.fromFloatString(amount) - currentPositionAmount,
    }),
    [collateral, amount, currentCollateral, currentPositionAmount],
  )

  const hasFormErrors = Object.keys(errors).length > 0
  const disableTradeBtn = (!positionDelta.positionDelta && !positionDelta.collateralDelta) || hasFormErrors

  const collateralValidators = useCollateralValidators({
    usdcBalance: balances?.usdc ?? 0n,
    requiredMaintenance: userMaintenance ?? 0n,
    minCollateral: protocolSnapshot?.minCollateral ?? 0n,
    currentCollateral,
  })
  const globalNext = next(globalPre, product.position)
  const amountValidators = usePositionValidators({
    liquidity: Big18Math.max(0n, globalNext.maker - globalNext.taker),
  })
  const leverageValidators = useLeverageValidators({
    maxLeverage,
  })
  const notional = Big18Math.mul(Big18Math.fromFloatString(amount), Big18Math.abs(price))

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
        <Flex flexDirection="column" p="16px" pb="8px">
          <Flex justifyContent="space-between" mb="14px">
            <Text color={textColor}>
              {hasPosition && positionStatus !== PositionStatus.closed ? copy.modifyPosition : copy.trade}
            </Text>
            {!!address && (positionStatus === PositionStatus.closed || positionStatus === PositionStatus.closing) && (
              <TxButton
                variant="text"
                label={copy.withdrawCollateral}
                p={0}
                lineHeight={1}
                height="initial"
                fontSize="13px"
                color={textBtnColor}
                _hover={{ color: textBtnHoverColor }}
                onClick={onWithdrawCollateral}
                isLoading={positionStatus === PositionStatus.closing}
                loadingText={copy.withdrawCollateral}
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
            key={FormNames.collateral}
            labelText={copy.collateral}
            title={copy.collateral}
            placeholder="0.0000"
            rightLabel={
              <FormLabel mr={0} mb={0}>
                {!!address && (
                  <Flex gap={1}>
                    <Text variant="label">
                      {formatBig18USDPrice(balances?.usdc, { fromUsdc: true }) ?? copy.zeroUsd}
                    </Text>
                    <Button
                      variant="text"
                      padding={0}
                      height="unset"
                      label={copy.max}
                      size="xs"
                      textDecoration="underline"
                      onClick={onClickMaxCollateral}
                    />
                  </Flex>
                )}
              </FormLabel>
            }
            rightEl={<Pill text={assetMetadata.quoteCurrency} />}
            mb="12px"
            control={control}
            name={FormNames.collateral}
            onChange={(e) => onChangeCollateral(e.target.value)}
            validate={!!address ? collateralValidators : {}}
            isRequired={!!address}
          />
          <Input
            key={FormNames.amount}
            labelText={copy.amount}
            placeholder="0.0000"
            rightLabel={
              <FormLabel mr={0} mb={0}>
                {notional > 0n && <FormattedBig18USDPrice variant="label" value={notional} />}
              </FormLabel>
            }
            rightEl={<Pill text={assetMetadata.baseCurrency} />}
            mb="12px"
            control={control}
            name={FormNames.amount}
            onChange={(e) => onChangeAmount(e.target.value)}
            validate={!!address ? amountValidators : {}}
            isRequired={!!address}
          />
          <Slider
            label={copy.leverage}
            ariaLabel="leverage-slider"
            min={0}
            max={maxLeverage}
            step={0.1}
            control={control}
            name={FormNames.leverage}
            onChange={onChangeLeverage}
            validate={!!address ? leverageValidators : {}}
          />
          <Flex height={6} width="100%" justifyContent="flex-end" px={2} mt={2}>
            {Object.keys(dirtyFields).length > 0 && (
              <IconButton
                ml="auto"
                justifyContent="flex-end"
                height="100%"
                variant="text"
                icon={<RepeatIcon />}
                onClick={resetInputs}
                aria-label={copy.reset}
              />
            )}
          </Flex>
        </Flex>
        <Divider mt="auto" />
        <Flex flexDirection="column" p="16px">
          <TradeReceipt mb="25px" px="3px" product={product} positionDelta={positionDelta} positionDetails={position} />
          {hasPosition && positionStatus !== PositionStatus.closed && positionStatus !== PositionStatus.closing ? (
            <ButtonGroup>
              <Button
                variant="transparent"
                label={copy.closePosition}
                onClick={() => setTradeFormState(FormState.close)}
              />
              <TxButton flex={1} label={copy.modifyPosition} type="submit" isDisabled={disableTradeBtn} overrideLabel />
            </ButtonGroup>
          ) : (
            <TxButton
              type="submit"
              isDisabled={disableTradeBtn}
              label={address ? copy.placeTrade : copy.connectWallet}
              overrideLabel
            />
          )}
        </Flex>
      </Form>
    </>
  )
}

export default TradeForm
