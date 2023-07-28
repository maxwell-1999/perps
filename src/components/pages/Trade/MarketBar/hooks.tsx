import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { useMarketContext } from '@/contexts/marketContext'
import { useAsset7DayData, useAsset24hrData, useChainLivePrices } from '@/hooks/markets'
import { Big18Math, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'
import { utilization } from '@/utils/positionUtils'
import { Hour } from '@/utils/timeUtils'

export const useSelectorCopy = () => {
  const intl = useIntl()
  return {
    switchMarket: intl.formatMessage({ defaultMessage: 'Switch Market' }),
    market: intl.formatMessage({ defaultMessage: 'Market' }),
    priceLiquidity: intl.formatMessage({ defaultMessage: 'Price / Liquidity' }),
    close: intl.formatMessage({ defaultMessage: 'Close' }),
  }
}

export const useMarketBarCopy = () => {
  const intl = useIntl()
  return {
    dailyChange: intl.formatMessage({ defaultMessage: '24h Change' }),
    hourlyFunding: intl.formatMessage({ defaultMessage: 'Funding Rate (1h)' }),
    low: intl.formatMessage({ defaultMessage: '24h Low' }),
    high: intl.formatMessage({ defaultMessage: '24h High' }),
    volume: intl.formatMessage({ defaultMessage: '24h Volume' }),
    volumeLS: intl.formatMessage({ defaultMessage: '7d Volume (L/S)' }),
    openInterest: intl.formatMessage({ defaultMessage: 'Open Interest (L/S)' }),
    liquidity: intl.formatMessage({ defaultMessage: 'Liquidity (L/S)' }),
    utilization: intl.formatMessage({ defaultMessage: 'Utilization (L/S)' }),
  }
}

export const useFormattedMarketBarValues = () => {
  const livePrices = useChainLivePrices()
  const {
    selectedMarket,
    selectedMarketSnapshot: snapshot,
    selectedMakerMarketSnapshot: makerSnapshot,
    snapshots,
    isMaker,
    makerAsset,
  } = useMarketContext()

  const { data: dailyData } = useAsset24hrData(isMaker ? makerAsset : selectedMarket)
  const { data: weeklyData } = useAsset7DayData(isMaker ? makerAsset : selectedMarket)

  const totalVolume = useMemo(() => {
    if (!dailyData?.volume) return 0n
    return dailyData.volume.reduce((acc, cur) => acc + BigInt(cur.takerNotional), 0n)
  }, [dailyData?.volume])

  const longRate = (isMaker ? makerSnapshot?.rate ?? 0n : snapshot?.Long?.rate ?? 0n) * Hour
  const shortRate = (isMaker ? makerSnapshot?.rate ?? 0n : snapshot?.Short?.rate ?? 0n) * Hour
  const currentPrice = isMaker
    ? Big18Math.abs(
        livePrices[makerAsset] ?? makerSnapshot?.latestVersion?.price ?? makerSnapshot?.latestVersion?.price ?? 0n,
      )
    : Big18Math.abs(
        livePrices[selectedMarket] ??
          snapshot?.Long?.latestVersion?.price ??
          snapshot?.Short?.latestVersion?.price ??
          0n,
      )
  const change = currentPrice - BigInt(dailyData?.start?.at(0)?.price ?? currentPrice)
  const longMakerSnapshot = snapshots?.[makerAsset]?.Long
  const longUtilization = longMakerSnapshot?.pre
    ? formatBig18Percent(utilization(longMakerSnapshot?.pre, longMakerSnapshot?.position))
    : '--'
  const shortMakerSnapshot = snapshots?.[makerAsset]?.Short
  const shortUtilization = shortMakerSnapshot?.pre
    ? formatBig18Percent(utilization(shortMakerSnapshot?.pre, shortMakerSnapshot?.position))
    : '--'

  const longOpenInterest = isMaker ? longMakerSnapshot?.openInterest?.taker : snapshot?.Long?.openInterest?.taker
  const shortOpenInterest = isMaker ? shortMakerSnapshot?.openInterest?.taker : snapshot?.Short?.openInterest?.taker

  const longLiquidity = isMaker ? longMakerSnapshot?.openInterest?.maker : snapshot?.Long?.openInterest?.maker
  const shortLiquidity = isMaker ? shortMakerSnapshot?.openInterest?.maker : snapshot?.Short?.openInterest?.maker

  return {
    price: formatBig18USDPrice(currentPrice),
    change: formatBig18Percent(Big18Math.abs(Big18Math.div(change, BigInt(dailyData?.start?.at(0)?.price || 1)))),
    changeIsNegative: change < 0n,
    hourlyFunding: `${formatBig18Percent(longRate, { numDecimals: 4 })} / ${formatBig18Percent(shortRate, {
      numDecimals: 4,
    })}`,
    low: formatBig18USDPrice(BigInt(dailyData?.low?.at(0)?.price || 0)),
    high: formatBig18USDPrice(BigInt(dailyData?.high?.at(0)?.price || 0)),
    volume: formatBig18USDPrice(totalVolume, { compact: true }),
    openInterest: `${formatBig18USDPrice(longOpenInterest, {
      compact: true,
    })} / ${formatBig18USDPrice(shortOpenInterest, { compact: true })}`,
    liquidity: `${formatBig18USDPrice(longLiquidity, {
      compact: true,
    })} / ${formatBig18USDPrice(shortLiquidity, { compact: true })}`,
    utilization: `${longUtilization} / ${shortUtilization}`,
    volumeLS: `${formatBig18USDPrice(weeklyData?.takerVolumes.Long ?? 0n, { compact: true })} / ${formatBig18USDPrice(
      weeklyData?.takerVolumes.Short ?? 0n,
      { compact: true },
    )}`,
  }
}
