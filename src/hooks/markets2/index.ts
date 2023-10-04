import { useQuery } from '@tanstack/react-query'

import { AssetMetadata, SupportedAsset } from '@/constants/markets'
import { PythDatafeedUrl } from '@/constants/network'
import { Big6Math } from '@/utils/big6Utils'
import { last24hrBounds } from '@/utils/timeUtils'

export * from './chain'
export * from './graph'

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
