import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { useMarketContext } from '@/contexts/marketContext'
import { useAsset24hrData, useChainLivePrices } from '@/hooks/markets'
import { Big18Math, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'
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
    change: intl.formatMessage({ defaultMessage: 'Change' }),
    hourlyFunding: intl.formatMessage({ defaultMessage: 'Hourly Funding' }),
    low: intl.formatMessage({ defaultMessage: '24h Low' }),
    high: intl.formatMessage({ defaultMessage: '24h High' }),
    volume: intl.formatMessage({ defaultMessage: '24h Volume' }),
    openInterest: intl.formatMessage({ defaultMessage: 'Open Interest' }),
    liquidity: intl.formatMessage({ defaultMessage: 'Liquidity' }),
  }
}

export const useFormattedMarketBarValues = () => {
  const livePrices = useChainLivePrices()
  const { selectedMarket, selectedMarketSnapshot: snapshot } = useMarketContext()
  const { data: dailyData } = useAsset24hrData(selectedMarket)

  const totalVolume = useMemo(() => {
    if (!dailyData?.volume) return 0n
    return dailyData.volume.reduce((acc, cur) => acc + BigInt(cur.takerNotional), 0n)
  }, [dailyData?.volume])

  const longRate = (snapshot?.long?.rate ?? 0n) * Hour
  const shortRate = (snapshot?.short?.rate ?? 0n) * Hour
  const currentPrice = Big18Math.abs(
    livePrices[selectedMarket] ?? snapshot?.long?.latestVersion?.price ?? snapshot?.short?.latestVersion?.price ?? 0n,
  )
  const change = currentPrice - BigInt(dailyData?.start?.at(0)?.price ?? currentPrice)

  return {
    price: formatBig18USDPrice(currentPrice),
    change: formatBig18Percent(Big18Math.div(change, BigInt(dailyData?.start?.at(0)?.price || 1))),
    hourlyFunding: `${formatBig18Percent(longRate, { numDecimals: 4 })} / ${formatBig18Percent(shortRate, {
      numDecimals: 4,
    })}`,
    low: formatBig18USDPrice(BigInt(dailyData?.low?.at(0)?.price || 0)),
    high: formatBig18USDPrice(BigInt(dailyData?.high?.at(0)?.price || 0)),
    volume: formatBig18USDPrice(totalVolume, { compact: true }),
    openInterest: `${formatBig18USDPrice(snapshot?.long?.openInterest?.taker, {
      compact: true,
    })} / ${formatBig18USDPrice(snapshot?.short?.openInterest?.taker, { compact: true })}`,
    liquidity: `${formatBig18USDPrice(snapshot?.long?.openInterest?.maker, {
      compact: true,
    })} / ${formatBig18USDPrice(snapshot?.short?.openInterest?.maker, { compact: true })}`,
  }
}
