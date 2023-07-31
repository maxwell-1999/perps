import { Flex, FlexProps, Text, useColorModeValue } from '@chakra-ui/react'

import { DataRow } from '@/components/design-system'
import { TooltipIcon, TooltipText } from '@/components/design-system/Tooltip'
import colors from '@/components/design-system/theme/colors'
import { useMarketContext } from '@/contexts/marketContext'
import { PositionDetails, useAsset7DayData, useChainLivePrices } from '@/hooks/markets'
import { Big18Math, formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'
import { calcLeverage, calcLiquidationPrice, getMakerStats, utilization } from '@/utils/positionUtils'
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
  const { isMaker, makerAsset, makerOrderDirection, selectedMakerMarketSnapshot: makerSnapshot } = useMarketContext()
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
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
  const globalPosition = {
    taker: !isMaker ? position.taker + positionDelta.positionDelta : position.taker,
    maker: isMaker ? position.maker + positionDelta.positionDelta : position.maker,
  }
  const currentUtilization = utilization(globalPre, globalPosition)
  const fundingRate = computeFundingRate(utilizationCurve, currentUtilization)
  const hourlyFundingRate = (fundingRate / Year) * Hour
  const close = positionDelta.positionDelta < 0n
  const takerFeeRate = Big18Math.toFloatString(takerFee * 100n)
  const makerFeeRate = Big18Math.toFloatString(makerFee * 100n)
  const { data: asset7DayData } = useAsset7DayData(makerAsset)
  const fees7Day = asset7DayData?.fees?.[makerOrderDirection] ?? 0n

  const makerStats = getMakerStats({
    product,
    leverage: newLeverage,
    userPosition: newPosition,
    collateral: newCollateral,
    snapshot: makerSnapshot,
    fees7Day,
    positionDelta: positionDelta.positionDelta,
  })

  return (
    <Flex flexDirection="column" {...props}>
      {isMaker && (
        <>
          <DataRow
            label={copy.fundingFees}
            value={formatBig18Percent(makerStats?.fundingFeeAPR ?? 0n, { numDecimals: 4 })}
          />
          <DataRow
            label={
              <Flex alignItems="center" gap={2}>
                <Text variant="label">{copy.tradingFees}</Text>
                <TooltipIcon
                  height="11px"
                  width="11px"
                  color={alpha50}
                  tooltipText={<Text fontSize="11px">{copy.tradingFeeCalculation}</Text>}
                />
              </Flex>
            }
            value={formatBig18Percent(makerStats?.tradingFeeAPR ?? 0n, { numDecimals: 4 })}
          />
          <DataRow
            label={
              <Flex alignItems="center" gap={2}>
                <Text variant="label">{copy.totalAPR}</Text>
                <TooltipIcon
                  height="11px"
                  width="11px"
                  color={alpha50}
                  tooltipText={<Text fontSize="11px">{copy.totalAprCalculation}</Text>}
                />
              </Flex>
            }
            value={formatBig18Percent(makerStats?.totalAPR ?? 0n, { numDecimals: 4 })}
          />
          <DataRow label={copy.currentExposure} value={formatBig18Percent(makerStats?.exposure ?? 0n)} />
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
