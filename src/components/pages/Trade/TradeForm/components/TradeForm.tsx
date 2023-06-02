import { Divider, Flex, FormLabel, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import Toggle from '@/components/shared/Toggle'
import { OpenPositionType, OrderDirection } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { useProductTransactions, useUserCollateral } from '@/hooks/markets'
import { useBalances } from '@/hooks/wallet'
import { Big18Math, formatBig18, formatBig18USDPrice } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'
import { Slider } from '@ds/Slider'

import { IPerennialLens } from '@t/generated/LensAbi'

import { useFormatPosition } from '../../PositionManager/hooks'
import { formIds, orderDirections } from '../constants'
import { useInitialInputs, useStyles, useTradeFormCopy } from '../hooks'
import {
  calcPositionFee,
  calculateAndUpdateCollateral,
  calculateAndUpdateLeverage,
  calculateAndUpdatePosition,
  formatStringToBigint,
  getCollateralDifference,
  getLeverageDifference,
  getPositionDifference,
  max18Decimals,
  needsApproval,
  usePrevious,
} from '../utils'
import AdjustPositionModal from './AdjustPositionModal'
import { Adjustment, AdjustmentType } from './AdjustPositionModal/constants'
import { TradeReceipt } from './Receipt'
import { Form } from './styles'

interface TradeFormProps {
  orderDirection: OrderDirection
  setOrderDirection: (orderDirection: OrderDirection) => void
  product: IPerennialLens.ProductSnapshotStructOutput
}

function TradeForm(props: TradeFormProps) {
  const { orderDirection, setOrderDirection, product } = props
  const {
    productAddress,
    latestVersion: { price },
    productInfo: { takerFee, symbol },
  } = product
  const prevProductAddress = usePrevious(productAddress)

  const { textColor, textBtnColor, textBtnHoverColor } = useStyles()
  const copy = useTradeFormCopy()
  const { data: balances } = useBalances()
  const { setTradeFormState } = useTradeFormState()
  const { address } = useAccount()
  const prevAddress = usePrevious(address)
  const { assetMetadata } = useMarketContext()
  const { onApproveUSDC, onModifyPosition } = useProductTransactions(productAddress)

  const position = useFormatPosition()
  const currentPositionAmount = position?.positionDetails?.position ?? 0n
  const currentCollateral = position?.positionDetails?.currentCollateral ?? 0n
  const isNewPosition = Big18Math.isZero(currentPositionAmount ?? 0n)

  const { data: collateralData } = useUserCollateral(productAddress)

  const initialInputs = useInitialInputs({
    userCollateral: position?.positionDetails?.currentCollateral ?? 0n,
    price: price ?? 0n,
    amount: position?.positionDetails?.position ?? 0n,
    isNewPosition,
  })

  const [adjustment, setAdjustment] = useState<Adjustment | null>(null)
  const [positionAmountStr, setPositionAmount] = useState<string>(initialInputs.positionAmount)
  const [collateralAmountStr, setCollateralAmount] = useState<string>(initialInputs.collateralAmount)
  const [collateralHasInput, setCollateralHasInput] = useState<boolean>(false)
  const [leverage, setLeverage] = useState<string>(initialInputs.leverage)
  const [isLeverageFixed, setIsLeverageFixed] = useState(initialInputs.isLeverageFixed)
  const [updating, setUpdating] = useState<boolean>(isNewPosition)
  const prevUpdating = usePrevious(updating)

  const positionAmount = formatStringToBigint(positionAmountStr)
  const collateralAmount = formatStringToBigint(collateralAmountStr)

  const resetInputs = useCallback(() => {
    if (!collateralHasInput) setCollateralAmount(initialInputs.collateralAmount) // If collateral is not modified, update it
    if (updating) return // Don't change values if updating
    setPositionAmount(initialInputs.positionAmount)
    setIsLeverageFixed(initialInputs.isLeverageFixed)
    setLeverage(initialInputs.leverage)
    setCollateralHasInput(false)
  }, [initialInputs, updating, collateralHasInput])

  useEffect(() => {
    if (prevProductAddress !== productAddress) resetInputs()
    // If going from discnnected to connected, reset updating state
    else if (!prevAddress && address) setUpdating(isNewPosition)
    else if (prevAddress !== address) resetInputs()
    else if (!Big18Math.eq(collateralAmount, currentCollateral))
      resetInputs() // Update collateral field on price update
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

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value
    const validatedAmount = max18Decimals(newAmount)
    setPositionAmount(validatedAmount)

    if (isLeverageFixed) {
      const newCollateralAmt = calculateAndUpdateCollateral({ amount: validatedAmount, leverage, price })
      setCollateralAmount(newCollateralAmt)
    } else {
      const newLeverage = calculateAndUpdateLeverage({
        amount: validatedAmount,
        collateral: collateralAmountStr,
        price,
      })
      setLeverage(newLeverage)
    }
  }

  const onChangeLeverage = (newLeverage: number) => {
    const validatedLeverage = max18Decimals(`${newLeverage}`)
    setLeverage(validatedLeverage)
    const newPosition = calculateAndUpdatePosition({
      collateral: collateralAmountStr,
      leverage: validatedLeverage,
      price,
    })
    setPositionAmount(newPosition)
  }

  const onChangeCollateral = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value
    const validatedAmount = max18Decimals(newAmount)
    setCollateralAmount(validatedAmount)
    setCollateralHasInput(true)

    if (isLeverageFixed) {
      const newPosition = calculateAndUpdatePosition({
        collateral: collateralAmountStr,
        leverage,
        price,
      })
      setPositionAmount(newPosition)
    } else {
      const newLeverage = calculateAndUpdateLeverage({
        amount: positionAmountStr,
        collateral: validatedAmount,
        price,
      })
      setLeverage(newLeverage)
    }
  }

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

    setAdjustment({
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
      adjustmentType: Big18Math.isZero(currentPositionAmount) ? AdjustmentType.Create : AdjustmentType.Adjust,
    })
  }

  const closeAdjustmentModal = () => {
    setAdjustment(null)
    setUpdating(false)
  }

  const cancelAdjustmentModal = () => {
    setAdjustment(null)
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
          <Flex justifyContent="space-between" mb="14px">
            <Text color={textColor}>{copy.trade}</Text>
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
          </Flex>
          <Flex mb="14px">
            <Toggle<OrderDirection>
              labels={orderDirections}
              activeLabel={orderDirection}
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
            value={
              updating
                ? collateralAmountStr
                : collateralAmount === 0n
                ? '0.00'
                : `${formatBig18(collateralAmount, { numSigFigs: 6 })}}`
            }
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
          <Button type="submit" label={copy.placeTrade} />
        </Flex>
      </Form>
    </>
  )
}

export default TradeForm
