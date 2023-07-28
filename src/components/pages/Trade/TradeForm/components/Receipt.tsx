import { Flex, FlexProps } from '@chakra-ui/react'

import { DataRow } from '@/components/design-system'
import { TooltipText } from '@/components/design-system/Tooltip'
import { useMarketContext } from '@/contexts/marketContext'
import { PositionDetails, useChainLivePrices } from '@/hooks/markets'
import { Big18Math, formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'
import { calcLeverage, calcLiquidationPrice, utilization } from '@/utils/positionUtils'
import { Hour, Year } from '@/utils/timeUtils'
import { computeFundingRate } from '@/utils/utilizationRateUtils'

import { ProductSnapshot } from '@t/perennial'

import { useReceiptCopy } from '../hooks'
import { calcPositionFee } from '../utils'

interface ReceiptProps {
  product: ProductSnapshot
  positionDetails?: PositionDetails
  positionDelta: {
    collateralDelta: bigint
    positionDelta: bigint
    fullClose?: boolean
  }
  showCollateral?: boolean
  showLeverage?: boolean
  leverage?: string
}

export function TradeReceipt({
  product,
  positionDelta,
  positionDetails,
  showCollateral,
  showLeverage,
  leverage,
  ...props
}: ReceiptProps & FlexProps) {
  const copy = useReceiptCopy()
  const livePrices = useChainLivePrices()
  const { isMaker } = useMarketContext()

  const {
    productInfo: { takerFee, utilizationCurve, makerFee },
    latestVersion: { price },
    pre: globalPre,
    position,
  } = product

  const tradingFee = calcPositionFee(price, positionDelta.positionDelta, isMaker ? makerFee : takerFee)
  const newPosition = positionDelta.positionDelta + (positionDetails?.nextPosition ?? 0n)
  const newCollateral = positionDelta.fullClose
    ? 0n
    : positionDelta.collateralDelta + (positionDetails?.currentCollateral ?? 0n)
  const newLeverage = calcLeverage(price, newPosition, newCollateral)

  const liquidationPrice = calcLiquidationPrice(
    product,
    { maker: isMaker ? newPosition : 0n, taker: isMaker ? 0n : newPosition },
    newCollateral,
    {
      maker: isMaker ? positionDelta.positionDelta : 0n,
      taker: isMaker ? 0n : positionDelta.positionDelta,
    },
  )
  const globalPosition = { ...position, taker: position.taker + positionDelta.positionDelta }
  const currentUtilization = utilization(globalPre, globalPosition)
  const fundingRate = computeFundingRate(utilizationCurve, currentUtilization)
  const hourlyFundingRate = (fundingRate / Year) * Hour
  const close = positionDelta.positionDelta < 0n
  const takerFeeRate = Big18Math.toFloatString(takerFee * 100n)
  const makerFeeRate = Big18Math.toFloatString(makerFee * 100n)
  const exposure = Big18Math.mul(currentUtilization, leverage ? Big18Math.fromFloatString(leverage) : 0n)
  const fundingFees = Big18Math.mul(fundingRate, exposure)
  // const tradingFees = Big18Math.div(takerFee, position.maker)

  return (
    <Flex flexDirection="column" {...props}>
      {isMaker && (
        <>
          <DataRow label={copy.currentExposure} value={formatBig18Percent(exposure)} />
          <DataRow label={copy.fundingFees} value={formatBig18Percent(fundingFees, { numDecimals: 4 })} />
          {/* <DataRow label={copy.tradingFees} value={formatBig18Percent(tradingFees, { numDecimals: 4 })} />
          <DataRow label={copy.totalAPR} value={formatBig18Percent(tradingFees + fundingFees, { numDecimals: 4 })} /> */}
        </>
      )}
      <DataRow
        label={!!close ? copy.estExit : copy.estEntry}
        value={formatBig18USDPrice(
          Big18Math.abs(positionDetails?.asset ? livePrices[positionDetails?.asset] ?? price : price),
        )}
      />
      {showCollateral && <DataRow label={copy.collateral} value={formatBig18USDPrice(newCollateral)} />}
      {showLeverage && <DataRow label={copy.leverage} value={`${formatBig18(newLeverage)}x`} />}
      {!isMaker && (
        <>
          <DataRow label={copy.liquidationPrice} value={formatBig18USDPrice(liquidationPrice)} />
          <DataRow
            label={copy.tradingFee}
            value={
              <TooltipText fontSize="13px" tooltipText={copy.tooltipFee(isMaker ? makerFeeRate : takerFeeRate)}>
                {formatBig18USDPrice(tradingFee)}
              </TooltipText>
            }
          />
        </>
      )}
      <DataRow label={copy.hourlyFundingRate} value={formatBig18Percent(hourlyFundingRate, { numDecimals: 4 })} />
    </Flex>
  )
}
