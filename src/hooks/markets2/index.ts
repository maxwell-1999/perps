import { PriceFeed } from '@pythnetwork/pyth-evm-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { chainAssetsWithAddress } from '@/constants/markets'
import { AssetMetadata, SupportedAsset } from '@/constants/markets'
import { isTestnet } from '@/constants/network'
import { PythDatafeedUrl } from '@/constants/network'
import { unique } from '@/utils/arrayUtils'
import { Big6Math, BigOrZero } from '@/utils/big6Utils'
import { last24hrBounds } from '@/utils/timeUtils'

import { PythOracleAbi } from '@abi/v2/PythOracle.abi'

import { useChainId, usePythSubscription, useViemWsClient } from '../network'
import { useMarketOracles2 } from './chain'

export const useMarket24HrHighLow = (asset: SupportedAsset) => {
  const metadata = AssetMetadata[asset]

  return useQuery({
    queryKey: ['market24HrHighLow', asset],
    enabled: !!metadata,
    queryFn: async () => {
      if (!metadata) return

      const { tvTicker, transform } = metadata
      const { from, to } = last24hrBounds()
      const request = await fetch(`${PythDatafeedUrl}/history?symbol=${tvTicker}&resolution=D&from=${from}&to=${to}`)
      const prices = (await request.json()) as { h: number[]; l: number[]; o: number[] }

      return {
        open: transform(Big6Math.fromFloatString(prices.o[0].toString())),
        high: transform(Big6Math.fromFloatString(Math.max(...prices.h).toString())),
        low: transform(Big6Math.fromFloatString(Math.min(...prices.l).toString())),
      }
    },
  })
}

export const useChainLivePrices2 = () => {
  const chain = useChainId()
  const markets = chainAssetsWithAddress(chain)
  const [prices, setPrices] = useState<{ [key in SupportedAsset]?: bigint }>({})
  const feedKey = isTestnet(chain) ? 'pythFeedIdTestnet' : 'pythFeedId'

  const [feedIds, feedToAsset] = useMemo(() => {
    const feedToAsset = markets.reduce((acc, { asset }) => {
      const feed = AssetMetadata[asset][feedKey]
      if (!feed) return acc
      if (acc[feed]) {
        acc[feed].push(asset)
      } else {
        acc[feed] = [asset]
      }
      return acc
    }, {} as { [key: string]: SupportedAsset[] })

    const feedIds = Object.keys(feedToAsset)

    return [feedIds, feedToAsset]
  }, [markets, feedKey])

  const feedSubscription = usePythSubscription(feedIds)
  const onUpdate = useCallback(
    (priceFeed: PriceFeed) => {
      const price = priceFeed.getPriceNoOlderThan(60)
      const normalizedExpo = price ? 6 + price?.expo : 0
      const normalizedPrice =
        normalizedExpo >= 0
          ? BigOrZero(price?.price) * 10n ** BigInt(normalizedExpo)
          : BigOrZero(price?.price) / 10n ** BigInt(Math.abs(normalizedExpo))
      setPrices((prices) => ({
        ...prices,
        ...feedToAsset['0x' + priceFeed.id].reduce((acc, asset) => {
          const { transform } = AssetMetadata[asset]
          // Pyth price is has `expo` (negative number) decimals, normalize to expected 18 decimals by multiplying by 10^(18 + expo)
          acc[asset] = price ? transform(normalizedPrice) : undefined
          return acc
        }, {} as { [key in SupportedAsset]?: bigint }),
      }))
    },
    [feedToAsset],
  )

  useEffect(() => {
    feedSubscription.on('updates', onUpdate)

    return () => {
      feedSubscription.off('updates', onUpdate)
    }
  }, [feedSubscription, onUpdate])

  return prices
}

export type LivePrices = Awaited<ReturnType<typeof useChainLivePrices2>>

const RefreshKeys = ['marketSnapshots2', 'marketPnls2']
export const useRefreshKeysOnPriceUpdates2 = (invalidKeys: string[] = RefreshKeys) => {
  const chainId = useChainId()
  const queryClient = useQueryClient()
  const { data: marketOracles, isPreviousData } = useMarketOracles2()
  const wsClient = useViemWsClient()

  const refresh = useCallback(() => {
    return queryClient.invalidateQueries({
      predicate: ({ queryKey }) => invalidKeys.includes(queryKey.at(0) as string) && queryKey.includes(chainId),
    })
  }, [invalidKeys, queryClient, chainId])

  const oracleProviders = useMemo(() => {
    if (!marketOracles || isPreviousData) return []
    return unique(Object.values(marketOracles).flatMap((p) => p.providerAddress))
  }, [marketOracles, isPreviousData])

  useEffect(() => {
    if (!oracleProviders.length) return
    const unwatchFns = oracleProviders.map((a) => {
      return [
        wsClient.watchContractEvent({
          address: a,
          abi: PythOracleAbi,
          eventName: 'OracleProviderVersionRequested',
          onLogs: () => refresh(),
        }),

        wsClient.watchContractEvent({
          address: a,
          abi: PythOracleAbi,
          eventName: 'OracleProviderVersionFulfilled',
          onLogs: () => refresh(),
        }),
      ]
    })
    return () => unwatchFns.flat().forEach((unwatch) => unwatch())
  }, [oracleProviders, refresh, wsClient])
}

export * from './chain'
export * from './graph'
export * from './tx'
