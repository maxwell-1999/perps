import { Text } from '@chakra-ui/react'

import { DataRow } from '@/components/design-system'
import { useMarketContext } from '@/contexts/marketContext'
import { MarketSnapshot, useChainLivePrices2 } from '@/hooks/markets2'
import { Big6Math, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import { calcEstExecutionPrice } from '@/utils/positionUtils'

import colors from '@ds/theme/colors'

import { useReceiptCopy } from '../../hooks'

interface EstimatedEntryRowProps {
  positionDelta: bigint
  totalTradingFee: bigint
  marketSnapshot: MarketSnapshot
}

export function EstimatedEntryRows({ positionDelta, totalTradingFee, marketSnapshot }: EstimatedEntryRowProps) {
  const copy = useReceiptCopy()
  const livePrices = useChainLivePrices2()
  const { orderDirection, selectedMarketSnapshot2, selectedMarket } = useMarketContext()
  const close = positionDelta < 0n

  const {
    global: { latestPrice: price },
  } = marketSnapshot
  const oraclePrice = livePrices[selectedMarket] ?? price

  const estExecutionPrice = !Big6Math.isZero(positionDelta)
    ? calcEstExecutionPrice({
        orderDirection,
        oraclePrice,
        positionDelta: Big6Math.abs(positionDelta),
        calculatedFee: totalTradingFee,
        positionFee: selectedMarketSnapshot2?.parameter.positionFee ?? 0n,
      })
    : { total: oraclePrice, priceImpact: 0n, priceImpactPercentage: 0n }

  return (
    <>
      <DataRow label={!!close ? copy.estExit : copy.estEntry} value={formatBig6USDPrice(estExecutionPrice.total)} />
      <DataRow
        label={copy.priceImpact}
        value={
          positionDelta === 0n ? (
            copy.noValue
          ) : (
            <Text fontSize="13px" color={estExecutionPrice.priceImpact === 0n ? colors.brand.green : colors.brand.red}>
              {formatBig6Percent(estExecutionPrice.priceImpactPercentage, { numDecimals: 4 })}
            </Text>
          )
        }
      />
    </>
  )
}
