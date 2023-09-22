import { RepeatIcon } from '@chakra-ui/icons'
import { QuestionOutlineIcon } from '@chakra-ui/icons'
import { ButtonGroup, Divider, Flex, FormLabel, Text } from '@chakra-ui/react'
import { arbitrum } from '@wagmi/chains'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Address } from 'viem'

import Toggle from '@/components/shared/Toggle'
import { TxButton } from '@/components/shared/TxButton'
import { FormattedBig18USDPrice, USDCETooltip } from '@/components/shared/components'
import { Form } from '@/components/shared/components'
import { SupportedAsset } from '@/constants/assets'
import { OpenPositionType, OrderDirection, PositionStatus } from '@/constants/markets'
import { useAuthStatus } from '@/contexts/authStatusContext'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { PositionDetails, ProductSnapshotWithTradeLimitations, useProtocolSnapshot } from '@/hooks/markets'
import { useAddress, useChainId } from '@/hooks/network'
import { useBalances } from '@/hooks/wallet'
import { Big18Math, formatBig18USDPrice } from '@/utils/big18Utils'
import { usePrevious } from '@/utils/hooks'
import { calcNotional, closedOrResolved, next } from '@/utils/positionUtils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'
import colors from '@ds/theme/colors'

import { FormNames, OrderValues, orderDirections } from '../constants'
import { useOnChangeHandlers, useStyles, useTradeFormCopy } from '../hooks'
import { calcMaxLeverage, formatInitialInputs } from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import LeverageInput from './LeverageInput'
import { TradeReceipt } from './Receipt'
import { GeoBlockedMessage, MarketClosedMessage, VpnDetectedMessage } from './styles'
import { useCollateralValidators, useLeverageValidators, usePositionValidators } from './validatorHooks'

interface TradeFormProps {
  asset: SupportedAsset
  orderDirection: OrderDirection
  setOrderDirection: (orderDirection: OrderDirection) => void
  product: ProductSnapshotWithTradeLimitations
  position?: PositionDetails
  crossCollateral: bigint
  crossProduct?: Address
  singleDirection?: boolean
}

function TradeForm(props: TradeFormProps) {
  const { geoblocked, vpnDetected } = useAuthStatus()
  const { orderDirection, setOrderDirection, product, position, singleDirection } = props
  const {
    productAddress,
    latestVersion: { price },
    maintenance,
    pre: globalPre,
    closed,
  } = product

  const prevProductAddress = usePrevious(productAddress)
  const chainId = useChainId()

  const { textColor, textBtnColor, textBtnHoverColor } = useStyles()
  const copy = useTradeFormCopy()
  const { data: balances } = useBalances()
  const { data: protocolSnapshot } = useProtocolSnapshot()
  const { setTradeFormState } = useTradeFormState()
  const { address } = useAddress()
  const prevAddress = usePrevious(address)
  const { assetMetadata, isMaker } = useMarketContext()
  const [orderValues, setOrderValues] = useState<OrderValues | null>(null)
  const positionStatus = position?.status ?? PositionStatus.resolved
  const hasPosition = positionStatus !== PositionStatus.resolved
  const positionOrderDirection = hasPosition ? position?.direction : undefined
  const currentPositionAmount = position?.nextPosition ?? 0n
  const currentCollateral = (position?.currentCollateral ?? 0n) + props.crossCollateral
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
    setOrderValues({ ...orderData, crossCollateral: props.crossCollateral })
  }

  const onWithdrawCollateral = () => {
    setTradeFormState(FormState.withdraw)
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

  const isRestricted = isMaker ? !product.canOpenMaker : !product.canOpenTaker
  const hasFormErrors = Object.keys(errors).length > 0
  const disableTradeBtn =
    (!positionDelta.positionDelta && !positionDelta.collateralDelta) || hasFormErrors || isRestricted

  const collateralValidators = useCollateralValidators({
    usdcBalance: balances?.usdc ?? 0n,
    requiredMaintenance: userMaintenance ?? 0n,
    minCollateral: protocolSnapshot?.minCollateral ?? 0n,
    currentCollateral,
  })
  const globalNext = next(globalPre, product.position)
  const amountValidators = usePositionValidators({
    liquidity: Big18Math.max(0n, globalNext.maker - globalNext.taker),
    isMaker: isMaker,
    totalMaker: globalNext.maker,
    totalTaker: globalNext.taker,
    currentPositionAmount,
    makerLimit: product.productInfo.makerLimit,
    marketClosed: closed || geoblocked,
  })
  const leverageValidators = useLeverageValidators({
    maxLeverage,
  })
  const notional = calcNotional(Big18Math.fromFloatString(amount), price)
  const userBalance = formatBig18USDPrice(balances?.usdc, { fromUsdc: true }) ?? copy.zeroUsd

  return (
    <>
      {orderValues && (
        <AdjustPositionModal
          isOpen={!!orderValues}
          onClose={closeAdjustmentModal}
          onCancel={cancelAdjustmentModal}
          title={isNewPosition ? copy.confirmOrder : copy.confirmChanges}
          positionType={isMaker ? OpenPositionType.maker : OpenPositionType.taker}
          asset={props.asset}
          position={position}
          product={product}
          crossProduct={props.crossProduct}
          orderValues={orderValues}
          usdcAllowance={balances?.usdcAllowance ?? 0n}
          leverage={leverage}
          positionDelta={positionDelta.positionDelta}
          variant="adjust"
        />
      )}
      <Form onSubmit={handleSubmit(onConfirm)}>
        <Flex flexDirection="column" p="16px" pb="8px">
          <Flex justifyContent="space-between" mb="14px">
            <Flex alignItems="center">
              <Text color={textColor} mr={2}>
                {hasPosition && positionStatus !== PositionStatus.closed
                  ? copy.modifyPosition
                  : isMaker
                  ? copy.Make
                  : copy.trade}
              </Text>
              {isMaker && (
                <Link
                  href="https://docs.perennial.finance/lps-makers/advanced-liquidity-provisioning"
                  target="_blank"
                  style={{
                    display: 'flex',
                    height: 'initial',
                    color: textColor,
                  }}
                >
                  <QuestionOutlineIcon cursor="pointer" height="13px" width="13px" />
                </Link>
              )}
            </Flex>
            {!!address && hasPosition && (
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
                actionAllowedInGeoblock
              />
            )}
          </Flex>
          {geoblocked && !vpnDetected && <GeoBlockedMessage mb={4} />}
          {geoblocked && vpnDetected && <VpnDetectedMessage mb={4} />}
          {closed && <MarketClosedMessage mb={4} />}
          {isRestricted && (
            <Flex mb="12px">
              <Text fontSize="11px" color={colors.brand.red}>
                {copy.isRestricted(isMaker)}
              </Text>
            </Flex>
          )}
          {!isMaker && (
            <Flex mb="14px">
              <Toggle<OrderDirection>
                labels={orderDirections}
                activeLabel={positionOrderDirection ? positionOrderDirection : orderDirection}
                onChange={setOrderDirection}
                overrideValue={
                  !closedOrResolved(positionStatus)
                    ? positionOrderDirection
                    : singleDirection
                    ? orderDirection
                    : undefined
                }
                activeColor={orderDirection === OrderDirection.Long ? colors.brand.green : colors.brand.red}
              />
            </Flex>
          )}
          <Flex flexDirection="column" gap="13px">
            <Input
              key={FormNames.collateral}
              // eslint-disable-next-line formatjs/no-literal-string-in-jsx
              label={`${copy.collateral}${props.crossCollateral > 0n ? '*' : ''}`}
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
              control={control}
              name={FormNames.collateral}
              onChange={(e) => onChangeCollateral(e.target.value)}
              validate={!!address ? collateralValidators : {}}
            />
            {props.crossCollateral > 0n && (
              <Text variant="label" fontSize="11px" m={1} mt={0}>
                {copy.crossCollateralInfo(
                  formatBig18USDPrice(props.crossCollateral),
                  orderDirection === OrderDirection.Long ? 'short' : 'long',
                )}
              </Text>
            )}
            <Input
              key={FormNames.amount}
              label={copy.amount}
              placeholder="0.0000"
              rightLabel={
                <FormLabel mr={0} mb={0}>
                  {notional > 0n && <FormattedBig18USDPrice variant="label" value={notional} />}
                </FormLabel>
              }
              rightEl={<Pill text={assetMetadata.baseCurrency} />}
              control={control}
              name={FormNames.amount}
              onChange={(e) => onChangeAmount(e.target.value)}
              validate={!!address ? amountValidators : {}}
            />
            <LeverageInput
              label={copy.leverage}
              min={0}
              max={maxLeverage}
              step={0.1}
              control={control}
              name={FormNames.leverage}
              onChange={onChangeLeverage}
              validate={!!address ? leverageValidators : {}}
            />
          </Flex>
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
              <TxButton
                flex={1}
                label={copy.modifyPosition}
                type="submit"
                isDisabled={disableTradeBtn}
                overrideLabel
                actionAllowedInGeoblock={positionDelta.positionDelta <= 0n} // allow closes and collateral changes in geoblock
              />
            </ButtonGroup>
          ) : (
            <TxButton type="submit" isDisabled={disableTradeBtn} label={copy.placeTrade} overrideLabel />
          )}
        </Flex>
      </Form>
    </>
  )
}

export default TradeForm
