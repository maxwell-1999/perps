import { Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { memo } from 'react'

import { ModalDetailContainer } from '@/components/shared/ModalComponents'
import { FormattedBig6, FormattedBig6USDPrice } from '@/components/shared/components'
import { AssetMetadata, PositionSide2, SupportedAsset } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { MarketSnapshot } from '@/hooks/markets2'
import { Big6Math, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import { calcEstExecutionPrice } from '@/utils/positionUtils'

import colors from '@ds/theme/colors'

import { OrderTypes } from '../../constants'
import { TriggerOrderDetails } from './constants'
import { useAdjustmentModalCopy } from './hooks'

const PositionValueDisplay = ({
  title,
  newValue,
  prevValue,
  usd,
  asset,
  leverage,
}: {
  title: string
  newValue: bigint | string
  prevValue?: bigint
  usd?: boolean
  leverage?: boolean
  asset?: SupportedAsset
  isLast?: boolean
}) => {
  const previousColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Text variant="label" fontSize="13px">
        {title}
      </Text>
      <Flex alignItems="center" flexWrap="wrap" justifyContent="flex-end">
        {prevValue !== undefined && (
          <>
            <Flex mr={1} alignItems="center">
              {!!usd ? (
                <FormattedBig6USDPrice fontSize="14px" color={previousColor} value={prevValue} />
              ) : (
                <FormattedBig6
                  fontSize="14px"
                  color={previousColor}
                  value={prevValue}
                  asset={asset}
                  leverage={leverage}
                />
              )}
              <Text ml={1} color={previousColor} fontSize="14px">
                {/* eslint-disable formatjs/no-literal-string-in-jsx */}→
              </Text>
            </Flex>
          </>
        )}
        <Flex>
          {typeof newValue === 'string' ? (
            <Text fontSize="14px">{newValue}</Text>
          ) : !!usd ? (
            <FormattedBig6USDPrice fontSize="14px" value={newValue} />
          ) : (
            <FormattedBig6 fontSize="14px" value={newValue} asset={asset} leverage={leverage} />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

interface PositionInfoProps {
  newCollateral: bigint
  prevCollateral: bigint
  newLeverage: bigint
  prevLeverage: bigint
  newPosition: bigint
  prevPosition: bigint
  positionDelta?: bigint
  asset: SupportedAsset
  isPrevious?: boolean
  positionSide: PositionSide2
  market: MarketSnapshot
  frozen: boolean
  interfaceFee: bigint
  tradeFee: bigint
  settlementFee: bigint
  triggerOrder: TriggerOrderDetails
  orderType?: OrderTypes
}

export const PositionInfo = memo(
  function PositionInfo({
    newCollateral,
    newLeverage,
    newPosition,
    prevCollateral,
    prevLeverage,
    prevPosition,
    positionDelta,
    asset,
    market,
    positionSide,
    interfaceFee,
    tradeFee,
    settlementFee,
    triggerOrder,
    orderType,
  }: PositionInfoProps) {
    const copy = useAdjustmentModalCopy()
    const { isMaker, orderDirection } = useMarketContext()

    const {
      global: { latestPrice: price },
      parameter: { positionFee },
    } = market

    const { stopLoss, takeProfit, limitPrice, size: triggerOrderSize } = triggerOrder
    const previousNotional = Big6Math.mul(prevPosition, Big6Math.abs(price))
    const isLimit = orderType === OrderTypes.limit
    const newNotional = Big6Math.mul(newPosition, Big6Math.abs(isLimit ? limitPrice : price))
    const { quoteCurrency } = AssetMetadata[asset]
    const estExecutionPrice =
      positionDelta && !Big6Math.isZero(positionDelta)
        ? calcEstExecutionPrice({
            orderDirection,
            oraclePrice: price,
            positionDelta: Big6Math.abs(positionDelta),
            calculatedFee: tradeFee,
            positionFee,
          })
        : { total: price, priceImpact: 0n, nonPriceImpactFee: 0n, priceImpactPercentage: 0n }

    const isTriggerOrder = orderType === OrderTypes.stopLoss || orderType === OrderTypes.takeProfit
    const showDivider = (!Big6Math.isZero(stopLoss) || !Big6Math.isZero(takeProfit)) && !isTriggerOrder

    return (
      <ModalDetailContainer>
        {orderType === OrderTypes.limit && !Big6Math.isZero(limitPrice) && (
          <PositionValueDisplay title={copy.limitPrice} newValue={formatBig6USDPrice(limitPrice)} />
        )}
        {orderType === OrderTypes.stopLoss && (
          <PositionValueDisplay title={copy.stopLoss} newValue={formatBig6USDPrice(stopLoss)} />
        )}
        {orderType === OrderTypes.takeProfit && (
          <PositionValueDisplay title={copy.takeProfit} newValue={formatBig6USDPrice(takeProfit)} />
        )}
        {isTriggerOrder && (
          <PositionValueDisplay
            title={copy.change}
            newValue={`${Big6Math.toFloatString(-triggerOrderSize)} ${asset.toUpperCase()}`}
          />
        )}
        <PositionValueDisplay
          title={copy.side}
          newValue={
            positionSide === PositionSide2.maker
              ? copy.maker
              : positionSide === PositionSide2.long
              ? copy.long
              : copy.short
          }
        />
        <PositionValueDisplay
          title={copy.positionSizeAsset(asset)}
          newValue={isTriggerOrder ? newPosition - triggerOrderSize : newPosition}
          prevValue={prevPosition}
          asset={asset}
        />
        {!isTriggerOrder && (
          <PositionValueDisplay
            title={copy.positionSizeAsset(quoteCurrency)}
            newValue={newNotional}
            prevValue={previousNotional}
            usd
          />
        )}
        <PositionValueDisplay title={copy.collateral} newValue={newCollateral} prevValue={prevCollateral} usd />
        <PositionValueDisplay title={copy.leverage} newValue={newLeverage} prevValue={prevLeverage} leverage isLast />
        {positionDelta !== undefined && !isMaker && !isTriggerOrder && (
          <>
            <PositionValueDisplay
              title={copy.priceImpact}
              newValue={formatBig6Percent(estExecutionPrice.priceImpactPercentage, { numDecimals: 4 })}
              usd
            />
            <PositionValueDisplay
              title={copy.fee}
              newValue={interfaceFee + settlementFee + estExecutionPrice.nonPriceImpactFee}
              usd
            />
          </>
        )}
        {positionDelta !== undefined && isMaker && (
          <PositionValueDisplay title={copy.fee} newValue={tradeFee + interfaceFee + settlementFee} usd />
        )}
        {showDivider && <Flex width="100%" height="1px" bg={colors.brand.whiteAlpha[30]} my={2} />}
        {!Big6Math.isZero(stopLoss) && !isTriggerOrder && (
          <PositionValueDisplay title={copy.stopLoss} newValue={formatBig6USDPrice(stopLoss)} />
        )}
        {!Big6Math.isZero(takeProfit) && !isTriggerOrder && (
          <PositionValueDisplay title={copy.takeProfit} newValue={formatBig6USDPrice(takeProfit)} />
        )}
      </ModalDetailContainer>
    )
  },
  ({ frozen: preFrozen }, { frozen }) => frozen && preFrozen, // Force no re-renders based on prop changes if marked as frozen
)
