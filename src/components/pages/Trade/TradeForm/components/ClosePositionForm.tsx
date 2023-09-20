import { ButtonGroup, Divider, Flex, FormLabel, Switch, Text } from '@chakra-ui/react'
import { arbitrum } from '@wagmi/chains'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import colors from '@/components/design-system/theme/colors'
import { TxButton } from '@/components/shared/TxButton'
import { Form, FormattedBig18, USDCETooltip } from '@/components/shared/components'
import { SupportedAsset } from '@/constants/assets'
import { OpenPositionType, PositionStatus } from '@/constants/markets'
import { useAuthStatus } from '@/contexts/authStatusContext'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { PositionDetails, ProductSnapshotWithTradeLimitations, useProtocolSnapshot } from '@/hooks/markets'
import { useAddress, useChainId } from '@/hooks/network'
import { useBalances } from '@/hooks/wallet'
import { Big18Math, formatBig18USDPrice } from '@/utils/big18Utils'
import { usePrevious } from '@/utils/hooks'
import { next } from '@/utils/positionUtils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'

import { FormNames, OrderValues, buttonPercentValues } from '../constants'
import { useOnChangeHandlers, useStyles, useTradeFormCopy } from '../hooks'
import { formatInitialInputs, isFullClose } from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import { TradeReceipt } from './Receipt'
import { FormOverlayHeader, GeoBlockedMessage, MarketClosedMessage } from './styles'
import { useCloseAmountValidator, useCollateralValidators } from './validatorHooks'

interface ClosePositionFormProps {
  asset: SupportedAsset
  position: PositionDetails
  product: ProductSnapshotWithTradeLimitations
  crossCollateral: bigint
}

function ClosePositionForm({ position, product, asset, crossCollateral }: ClosePositionFormProps) {
  const { setTradeFormState } = useTradeFormState()
  const { assetMetadata, isMaker } = useMarketContext()
  const { geoblocked } = useAuthStatus()
  const prevProductAddress = usePrevious(product.productAddress)

  const copy = useTradeFormCopy()
  const { percentBtnBg } = useStyles()
  const { data: balances } = useBalances()
  const { address } = useAddress()
  const { data: protocolSnapshot } = useProtocolSnapshot()
  const [orderValues, setOrderValues] = useState<OrderValues | null>(null)
  const [showCollateralInput, setShowCollateralInput] = useState(false)
  const chainId = useChainId()

  const {
    latestVersion: { price },
    closed,
  } = product
  const { nextPosition, nextLeverage, currentCollateral } = position
  const currentPositionAmount = position?.nextPosition ?? 0n
  const isNewPosition = Big18Math.isZero(currentPositionAmount)
  const positionStatus = position?.status ?? PositionStatus.resolved
  const closedOrGeoBlocked = closed || geoblocked

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
  const isRestricted = isMaker ? !product.canOpenMaker : !product.canOpenTaker

  useEffect(() => {
    const changedProducts = product.productAddress !== prevProductAddress
    if (changedProducts) {
      reset()
    }
    if (showCollateralInput) {
      reset(initialFormState)
    } else {
      reset({
        [FormNames.amount]: '',
        [FormNames.collateral]: '',
        [FormNames.leverage]: Big18Math.toFloatString(nextLeverage ?? 0n),
      })
    }
  }, [prevProductAddress, product.productAddress, reset, initialFormState, showCollateralInput, nextLeverage])

  const { onChangeAmount: amountChangeHandler, onChangeCollateral } = useOnChangeHandlers({
    setValue,
    leverage,
    collateral,
    amount,
    price,
    leverageFixed: !closedOrGeoBlocked,
  })

  const userMaintenance = position?.maintenance ?? 0n

  const collateralValidators = useCollateralValidators({
    usdcBalance: balances?.usdc ?? 0n,
    requiredMaintenance: userMaintenance ?? 0n,
    minCollateral: protocolSnapshot?.minCollateral ?? 0n,
    currentCollateral,
  })

  const onPerecentClick = useCallback(
    (percent: number) => {
      const newAmount = ((nextPosition ?? 0n) * BigInt(percent)) / 100n
      amountChangeHandler(Big18Math.toFloatString(newAmount))
    },
    [nextPosition, amountChangeHandler],
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
    if (showCollateralInput) {
      return {
        collateralDelta: Big18Math.fromFloatString(collateral) - currentCollateral,
        positionDelta: Big18Math.fromFloatString(amount) - currentPositionAmount,
      }
    }
    return {
      collateralDelta: -Big18Math.fromFloatString(collateral),
      positionDelta: -Big18Math.fromFloatString(amount),
      fullClose: isFullClose(amount, nextPosition ?? 0n),
    }
  }, [collateral, amount, nextPosition, showCollateralInput, currentCollateral, currentPositionAmount])

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

  const onConfirmCollateralChange = (orderData: { collateral: string; amount: string }) => {
    setOrderValues({
      collateral: orderData.collateral,
      amount: orderData.amount,
    })
    reset()
  }

  const hasFormErrors = Object.keys(errors).length > 0
  const disableCloseBtn =
    (!positionDelta.positionDelta && !positionDelta.collateralDelta) || hasFormErrors || isRestricted

  const globalNext = next(product.pre, product.position)
  const amountValidator = useCloseAmountValidator({
    currentPositionAmount: nextPosition ?? 0n,
    isMaker,
    totalMaker: globalNext.maker,
    totalTaker: globalNext.taker,
    marketClosed: closed,
  })
  const userBalance = formatBig18USDPrice(balances?.usdc, { fromUsdc: true }) ?? copy.zeroUsd

  return (
    <>
      {orderValues && (
        <AdjustPositionModal
          isOpen={!!orderValues}
          onClose={closeAdjustmentModal}
          onCancel={cancelAdjustmentModal}
          title={showCollateralInput ? copy.modifyCollateral : copy.closePosition}
          positionType={isMaker ? OpenPositionType.maker : OpenPositionType.taker}
          asset={asset}
          position={position}
          product={product}
          orderValues={orderValues}
          positionDelta={positionDelta.positionDelta}
          usdcAllowance={closedOrGeoBlocked ? balances?.usdcAllowance ?? 0n : 0n}
          variant={showCollateralInput ? 'adjust' : 'close'}
          leverage={leverage}
        />
      )}

      <Form onSubmit={showCollateralInput ? handleSubmit(onConfirmCollateralChange) : handleSubmit(onConfirm)}>
        <FormOverlayHeader
          marketClosed={closed}
          title={copy.closePosition}
          onClose={() => setTradeFormState(FormState.trade)}
          rightEl={
            closedOrGeoBlocked && (
              <Flex flexDirection="column" gap={2}>
                <TxButton
                  variant="text"
                  label={copy.withdrawCollateral}
                  p={0}
                  lineHeight={1}
                  height="initial"
                  fontSize="13px"
                  color={colors.brand.purple[240]}
                  _hover={{ color: colors.brand.purple[250] }}
                  onClick={() => {
                    setTradeFormState(FormState.withdraw)
                  }}
                  isLoading={positionStatus === PositionStatus.closing}
                  isDisabled={isRestricted}
                  loadingText={copy.withdrawCollateral}
                  actionAllowedInGeoblock
                />
              </Flex>
            )
          }
        />
        <Flex flexDirection="column" px="16px" mb="12px" gap="12px">
          {geoblocked && <GeoBlockedMessage />}
          {closed && <MarketClosedMessage />}
          {closedOrGeoBlocked && position.status === PositionStatus.open && !isRestricted && (
            <Flex alignItems="center" justifyContent="flex-end">
              <FormLabel htmlFor="collateral-toggle" mr={2} mb={0}>
                <Text variant="label">{showCollateralInput ? copy.closePosition : copy.modifyCollateral}</Text>
              </FormLabel>
              <Switch
                variant="tradeForm"
                aria-label={showCollateralInput ? copy.modifyCollateral : copy.closePosition}
                isChecked={showCollateralInput}
                onChange={() => {
                  setShowCollateralInput(!showCollateralInput)
                }}
              />
            </Flex>
          )}
          {!showCollateralInput && (
            <>
              <Input
                name={FormNames.amount}
                label={copy.amount}
                placeholder="0.0000"
                rightLabel={
                  <FormLabel mr={0} mb={0}>
                    <Text variant="label">
                      <FormattedBig18 value={nextPosition ?? 0n} asset={position.asset} as="span" />
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
            </>
          )}
          {showCollateralInput && (
            <Input
              mb={2}
              key={FormNames.collateral}
              // eslint-disable-next-line formatjs/no-literal-string-in-jsx
              label={`${copy.collateral}${crossCollateral > 0n ? '*' : ''}`}
              title={copy.collateral}
              placeholder="0.0000"
              rightLabel={
                <FormLabel mr={0} mb={0}>
                  {!!address && (
                    <Flex gap={1}>
                      {chainId === arbitrum.id ? (
                        <USDCETooltip userBalance={userBalance} />
                      ) : (
                        <Text variant="label">{userBalance}</Text>
                      )}
                    </Flex>
                  )}
                </FormLabel>
              }
              rightEl={<Pill text={assetMetadata.quoteCurrency} />}
              control={control}
              name={FormNames.collateral}
              onChange={(e) => onChangeCollateral(e.target.value)}
              validate={!!address ? collateralValidators : {}}
            />
          )}
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
            showLeverage={!closed}
          />
          <ButtonGroup>
            <Button
              label={copy.cancel}
              variant="transparent"
              onClick={() => setTradeFormState(FormState.trade)}
              isDisabled={closedOrGeoBlocked}
            />
            <TxButton
              flex={1}
              label={showCollateralInput ? copy.modifyCollateral : copy.closePosition}
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
