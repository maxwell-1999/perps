import { Flex, FlexProps } from '@chakra-ui/react'

import { DataRow } from '@/components/design-system'
import { PositionDetails, useChainLivePrices } from '@/hooks/markets'
import { Big18Math, formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'
import { calcLeverage, calcLiquidationPrice, utilization } from '@/utils/positionUtils'
import { Hour, Year } from '@/utils/timeUtils'
import { computeFundingRate } from '@/utils/utilizationRateUtils'

import { IPerennialLens, PositionStructOutput } from '@t/generated/LensAbi'

import { useReceiptCopy } from '../hooks'
import { calcPositionFee } from '../utils'

interface ReceiptProps {
  product: IPerennialLens.ProductSnapshotStructOutput
  positionDetails?: PositionDetails
  positionDelta: {
    collateralDelta: bigint
    positionDelta: bigint
    fullClose?: boolean
  }
  showCollateral?: boolean
  showLeverage?: boolean
}

export function TradeReceipt({
  product,
  positionDelta,
  positionDetails,
  showCollateral,
  showLeverage,
  ...props
}: ReceiptProps & FlexProps) {
  const copy = useReceiptCopy()
  const livePrices = useChainLivePrices()

  const {
    productInfo: { takerFee, utilizationCurve },
    latestVersion: { price },
    pre: globalPre,
    position,
  } = product

  const tradingFee = calcPositionFee(price, positionDelta.positionDelta, takerFee)
  const newPosition = positionDelta.positionDelta + (positionDetails?.nextPosition ?? 0n)
  const newCollateral = positionDelta.fullClose
    ? 0n
    : positionDelta.collateralDelta + (positionDetails?.currentCollateral ?? 0n)
  const newLeverage = calcLeverage(price, newPosition, newCollateral)
  const liquidationPrice = calcLiquidationPrice(
    product,
    { maker: 0n, taker: newPosition } as PositionStructOutput,
    newCollateral,
    { maker: 0n, taker: positionDelta.positionDelta } as PositionStructOutput,
  )
  const globalPosition = { ...position, taker: position.taker + positionDelta.positionDelta }
  const fundingRate = (computeFundingRate(utilizationCurve, utilization(globalPre, globalPosition)) / Year) * Hour

  const close = positionDelta.positionDelta < 0n
  return (
    <Flex flexDirection="column" {...props}>
      <DataRow
        label={!!close ? copy.estExit : copy.estEntry}
        value={formatBig18USDPrice(
          Big18Math.abs(positionDetails?.asset ? livePrices[positionDetails?.asset] ?? price : price),
        )}
      />
      {showCollateral && <DataRow label={copy.collateral} value={formatBig18USDPrice(newCollateral)} />}
      {showLeverage && <DataRow label={copy.leverage} value={`${formatBig18(newLeverage)}x`} />}
      <DataRow label={copy.liquidationPrice} value={formatBig18USDPrice(liquidationPrice)} />
      <DataRow label={copy.tradingFee} value={formatBig18USDPrice(tradingFee)} />
      <DataRow label={copy.hourlyFundingRate} value={formatBig18Percent(fundingRate, { numDecimals: 4 })} />
    </Flex>
  )
}
