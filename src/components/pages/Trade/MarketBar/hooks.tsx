import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { useMarketContext } from '@/contexts/marketContext'
import { useChainLivePrices2, useMarket7dData, useMarket24HrHighLow, useMarket24hrData } from '@/hooks/markets2'
import { Big6Math, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import { calcLpUtilization, calcSkew, calcTakerLiquidity } from '@/utils/positionUtils'

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
    hourlyFunding: intl.formatMessage({ defaultMessage: 'Funding Rate' }),
    low: intl.formatMessage({ defaultMessage: '24h Low' }),
    high: intl.formatMessage({ defaultMessage: '24h High' }),
    volume: intl.formatMessage({ defaultMessage: '24h Volume' }),
    volumeLS: intl.formatMessage({ defaultMessage: '7d Volume (L/S)' }),
    openInterest: intl.formatMessage({ defaultMessage: 'Open Interest (L/S)' }),
    liquidity: intl.formatMessage({ defaultMessage: 'Available Liquidity (L/S)' }),
    lpExposure: intl.formatMessage({ defaultMessage: 'LP Exposure' }),
    totalLiquidity: intl.formatMessage({ defaultMessage: 'Total liquidity (L/S)' }),
    skew: intl.formatMessage({ defaultMessage: 'Skew (L/S)' }),
    slash: intl.formatMessage({ defaultMessage: '/' }),
    fundingRateOption: {
      hourlyFunding: intl.formatMessage({ defaultMessage: '1H' }),
      eightHourFunding: intl.formatMessage({ defaultMessage: '8H' }),
      dailyFunding: intl.formatMessage({ defaultMessage: '24H' }),
      yearlyFunding: intl.formatMessage({ defaultMessage: '1Y' }),
    },
  }
}

export const useFormattedMarketBarValues = () => {
  const livePrices = useChainLivePrices2()
  const { selectedMarket: selectedMarket_, isMaker, selectedMarketSnapshot2, selectedMakerMarket } = useMarketContext()

  const selectedMarket = isMaker ? selectedMakerMarket : selectedMarket_
  const { data: priceData } = useMarket24HrHighLow(selectedMarket)
  const { data: dailyData } = useMarket24hrData(selectedMarket)
  const { data: weeklyData } = useMarket7dData(selectedMarket)

  const totalVolume = useMemo(() => {
    if (!dailyData?.volume) return 0n
    return dailyData.volume.reduce((acc, cur) => acc + BigInt(cur.longNotional) + BigInt(cur.shortNotional), 0n)
  }, [dailyData?.volume])

  const chainPrice = selectedMarketSnapshot2?.global?.latestPrice ?? 0n
  const currentPrice = livePrices[selectedMarket] ?? chainPrice ?? 0n
  const change = currentPrice - BigInt(priceData?.open ?? currentPrice)

  const latestPrice = selectedMarketSnapshot2?.global?.latestPrice ?? 0n
  const nextLong = selectedMarketSnapshot2?.nextPosition?.long ?? 0n
  const nextShort = selectedMarketSnapshot2?.nextPosition?.short ?? 0n
  const longOpenInterest = Big6Math.mul(nextLong, latestPrice)
  const shortOpenInterest = Big6Math.mul(nextShort, latestPrice)

  const availableLiq = selectedMarketSnapshot2 ? calcTakerLiquidity(selectedMarketSnapshot2) : undefined
  const lpUtilization = calcLpUtilization(selectedMarketSnapshot2)
  const calculatedSkew = calcSkew(selectedMarketSnapshot2)

  return {
    price: formatBig6USDPrice(currentPrice),
    change: formatBig6Percent(Big6Math.abs(Big6Math.div(change, priceData?.open ?? 1n))),
    changeIsNegative: change < 0n,
    low: formatBig6USDPrice(Big6Math.min(currentPrice, priceData?.low ?? 0n)),
    high: formatBig6USDPrice(Big6Math.max(currentPrice, priceData?.high ?? 0n)),
    volume: formatBig6USDPrice(totalVolume, { compact: true }),
    openInterest: `${formatBig6USDPrice(longOpenInterest, {
      compact: true,
    })} / ${formatBig6USDPrice(shortOpenInterest, { compact: true })}`,
    availableLiquidity: `${formatBig6USDPrice(Big6Math.mul(availableLiq?.availableLongLiquidity ?? 0n, latestPrice), {
      compact: true,
    })} / ${formatBig6USDPrice(Big6Math.mul(availableLiq?.availableShortLiquidity ?? 0n, latestPrice), {
      compact: true,
    })}`,
    totalLiquidity: `${formatBig6USDPrice(Big6Math.mul(availableLiq?.totalLongLiquidity ?? 0n, latestPrice), {
      compact: true,
    })} / ${formatBig6USDPrice(Big6Math.mul(availableLiq?.totalShortLiquidity ?? 0n, latestPrice), {
      compact: true,
    })}`,
    lpUtilization: lpUtilization?.formattedLpUtilization ?? '0.00%',
    lpExposure: lpUtilization?.exposureSide ?? '--',
    volumeLS: `${formatBig6USDPrice(weeklyData?.takerVolumes.long ?? 0n, { compact: true })} / ${formatBig6USDPrice(
      weeklyData?.takerVolumes.short ?? 0n,
      { compact: true },
    )}`,
    skew: formatBig6Percent(calculatedSkew?.skew ?? 0n),
    longSkew: formatBig6Percent(calculatedSkew?.longSkew ?? 0n),
    shortSkew: formatBig6Percent(calculatedSkew?.shortSkew ?? 0n),
  }
}
