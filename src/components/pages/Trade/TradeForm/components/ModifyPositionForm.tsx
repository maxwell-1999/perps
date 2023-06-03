import { ButtonGroup, Divider, Flex, FormLabel, Text, usePrevious } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { useAccount } from 'wagmi'

import Toggle from '@/components/shared/Toggle'
import { OpenPositionType, OrderDirection } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { PositionDetails, useProductTransactions, useUserCollateral } from '@/hooks/markets'
import { useBalances } from '@/hooks/wallet'
import { Big18Math, formatBig18USDPrice } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'
import { Slider } from '@ds/Slider'

import { IPerennialLens } from '@t/generated/LensAbi'

import { TradeFormState, formIds, orderDirections } from '../constants'
import { useInitialInputs, useOnChangeHandlers, useTradeFormCopy } from '../hooks'
import { Action, ActionTypes, getInitialReduxState, reducer } from '../reducer'
import {
  calcPositionFee,
  formatStringToBigint,
  getCollateralDifference,
  getLeverageDifference,
  getPositionDifference,
  needsApproval,
} from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import { Adjustment, AdjustmentType } from './AdjustPositionModal/constants'
import { TradeReceipt } from './Receipt'
import { Form } from './styles'

interface ModifyPositionProps {
  orderDirection: OrderDirection
  setOrderDirection: (orderDirection: OrderDirection) => void
  product: IPerennialLens.ProductSnapshotStructOutput
  position: PositionDetails
}

function ModifyPositionForm(props: ModifyPositionProps) {
  const { setOrderDirection, product, position } = props
  const {
    productAddress,
    latestVersion: { price },
    productInfo: { takerFee, symbol },
  } = product
  const prevProductAddress = usePrevious(productAddress)

  const copy = useTradeFormCopy()
  const { data: balances } = useBalances()
  const { setTradeFormState } = useTradeFormState()
  const { address } = useAccount()
  const prevAddress = usePrevious(address)
  const { assetMetadata } = useMarketContext()
  const { onApproveUSDC, onModifyPosition } = useProductTransactions(productAddress)

  const orderDirection = position.direction
  const currentPositionAmount = position.position ?? 0n
  const currentCollateral = position.currentCollateral ?? 0n
  const isNewPosition = Big18Math.isZero(currentPositionAmount)

  const { data: collateralData } = useUserCollateral(productAddress)

  const initialInputs = useInitialInputs({
    userCollateral: currentCollateral,
    price: price ?? 0n,
    amount: currentPositionAmount,
    isNewPosition,
  })

  const initialState = useMemo<Partial<TradeFormState>>(
    () => ({
      positionAmountStr: initialInputs.positionAmount,
      collateralAmountStr: initialInputs.collateralAmount,
      leverage: initialInputs.leverage,
      isLeverageFixed: initialInputs.isLeverageFixed,
      updating: isNewPosition,
    }),
    [initialInputs, isNewPosition],
  )

  const [state, dispatch] = useReducer<React.Reducer<TradeFormState, Action>>(
    reducer,
    getInitialReduxState(initialState),
  )

  const {
    updating,
    positionAmountStr,
    collateralAmountStr,
    leverage,
    isLeverageFixed,
    collateralHasInput,
    adjustment,
  } = state

  const prevUpdating = usePrevious(updating)

  const positionAmount = formatStringToBigint(positionAmountStr)
  const collateralAmount = formatStringToBigint(collateralAmountStr)

  const resetInputs = useCallback(() => {
    if (updating) return // Don't change values if updating
    dispatch({
      type: ActionTypes.RESET_FORM,
      payload: {
        ...initialState,
        collateralAmountStr: collateralHasInput ? collateralAmountStr : initialInputs.collateralAmount,
      },
    })
  }, [initialInputs, updating, collateralHasInput, collateralAmountStr, initialState])

  useEffect(() => {
    if (prevProductAddress !== productAddress) resetInputs()
    // If going from discnnected to connected, reset updating state
    else if (!prevAddress && address) dispatch({ type: ActionTypes.SET_UPDATING, payload: isNewPosition })
    else if (prevAddress !== address) resetInputs()
    else if (prevUpdating && !updating) resetInputs() // If going from updating -> not updating, reset
  }, [
    address,
    prevAddress,
    productAddress,
    prevProductAddress,
    currentCollateral,
    collateralAmount,
    prevUpdating,
    updating,
    isNewPosition,
    resetInputs,
  ])

  const { onChangeAmount, onChangeLeverage, onChangeCollateral } = useOnChangeHandlers({
    dispatch,
    isLeverageFixed,
    leverage,
    collateralAmountStr,
    positionAmountStr,
    price: product.latestVersion.price,
  })

  const onConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const collateralDifference = getCollateralDifference(collateralAmount, currentCollateral)
    const positionDifference = getPositionDifference(positionAmount, currentPositionAmount)
    const leverageDifference = getLeverageDifference({
      currentCollateral,
      price,
      currentPositionAmount,
      newCollateralAmount: collateralAmount,
      newPositionAMount: positionAmount,
    })

    const usdcAllowance = collateralData?.usdcAllowance ?? 0n
    const adjustmentState: Adjustment = {
      collateral: {
        newCollateral: collateralAmountStr,
        difference: collateralDifference,
        isWithdrawingTotalBalance: Big18Math.isZero(collateralAmount),
        needsApproval: needsApproval({ collateralDifference, usdcAllowance }),
        requiresManualWrap: false,
      },
      position: {
        newPosition: positionAmountStr,
        difference: positionDifference,
        isNewPosition,
        isClosingPosition: Big18Math.isZero(positionAmount),
        symbol,
        fee: calcPositionFee(price, positionDifference, takerFee),
      },
      leverage: leverage ?? undefined,
      leverageDifference,
      adjustmentType: AdjustmentType.Adjust,
    }
    dispatch({ type: ActionTypes.SET_ADJUSTMENT, payload: adjustmentState })
  }

  const closeAdjustmentModal = () => {
    dispatch({ type: ActionTypes.SET_ADJUSTMENT, payload: null })
    dispatch({ type: ActionTypes.SET_UPDATING, payload: false })
  }

  const cancelAdjustmentModal = () => {
    dispatch({ type: ActionTypes.SET_ADJUSTMENT, payload: null })
    resetInputs()
  }

  return (
    <>
      {adjustment && (
        <AdjustPositionModal
          isOpen={!!adjustment}
          onClose={closeAdjustmentModal}
          onCancel={cancelAdjustmentModal}
          onApproveUSDC={onApproveUSDC}
          onModifyPosition={onModifyPosition}
          title={'confirm'}
          adjustment={adjustment}
          positionType={OpenPositionType.taker}
        />
      )}
      <Form onSubmit={onConfirm}>
        <Flex flexDirection="column" p="16px">
          <Flex justifyContent="space-between" mb="14px" alignItems="center">
            <Text>{copy.modifyPosition}</Text>
          </Flex>
          <Flex mb="14px">
            <Toggle<OrderDirection>
              labels={orderDirections}
              activeLabel={orderDirection}
              overrideValue={orderDirection}
              onChange={setOrderDirection}
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
            value={collateralAmountStr}
            onChange={onChangeCollateral}
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
            value={positionAmountStr}
            onChange={onChangeAmount}
          />

          {/* Default slider til we get designs */}
          <Slider
            label={copy.leverage}
            ariaLabel="leverage-slider"
            min={0}
            max={20}
            step={0.1}
            value={parseFloat(leverage)}
            onChange={onChangeLeverage}
            containerProps={{
              mb: 2,
            }}
            focusThumbOnChange={false}
          />
        </Flex>
        <Divider mt="auto" />
        <Flex flexDirection="column" p="16px">
          <TradeReceipt mb="25px" px="3px" />
          <ButtonGroup>
            <Button label={copy.cancel} variant="transparent" onClick={() => setTradeFormState(FormState.trade)} />
            <Button flex={1} label={copy.modifyPosition} type="submit" />
          </ButtonGroup>
        </Flex>
      </Form>
    </>
  )
}

export default ModifyPositionForm
