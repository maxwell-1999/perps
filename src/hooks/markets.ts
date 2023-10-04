import { useQuery } from '@tanstack/react-query'
import { getAddress } from 'viem'

import { ChainMarkets, PositionSide2, SupportedAsset } from '@/constants/markets'
import { notEmpty } from '@/utils/arrayUtils'
import { getProductContract } from '@/utils/contractUtils'
import { getTradeLimitations } from '@/utils/positionUtils'

import { ProductSnapshot } from '@t/perennial'

import { useLensProductSnapshot, useLensUserProductSnapshot } from './contracts'
import { useAddress, useChainId } from './network'

export type ProductSnapshotWithTradeLimitations = ProductSnapshot & {
  canOpenMaker: boolean
  canOpenTaker: boolean
  closed: boolean
}

export type AssetSnapshots = {
  [key in SupportedAsset]?: {
    [PositionSide2.long]?: ProductSnapshotWithTradeLimitations
    [PositionSide2.short]?: ProductSnapshotWithTradeLimitations
  }
}
export const useChainAssetSnapshots = () => {
  const chainId = useChainId()
  const lens = useLensProductSnapshot()
  const userLens = useLensUserProductSnapshot()
  const { address } = useAddress()

  return useQuery({
    queryKey: ['assetSnapshots', chainId, address],
    queryFn: async () => {
      const assets = Object.keys(ChainMarkets[chainId]) as SupportedAsset[]
      const markets = assets
        .map((asset) => ChainMarkets[chainId][asset])
        .filter(notEmpty)
        .map((market) => [market.long, market.short].filter(notEmpty))
        .flat()

      const snapshots = await lens.read.snapshots([markets])
      const accountSnapshots = address && (await userLens.read.snapshots([address, markets]))
      const closedStatus = await Promise.all(
        markets.map(async (market) => ({
          market,
          closed: await getProductContract(market, chainId).read.closed(),
        })),
      )

      return assets.reduce((acc, asset) => {
        const longSnapshot = snapshots.find((s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.long)
        const shortSnapshot = snapshots.find(
          (s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.short,
        )
        const userLongSnapshot = accountSnapshots?.find(
          (s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.long,
        )
        const userShortSnapshot = accountSnapshots?.find(
          (s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.short,
        )
        const longTradeLimitations = getTradeLimitations(userLongSnapshot)
        const shortTradeLimitations = getTradeLimitations(userShortSnapshot)

        acc[asset] = {
          [PositionSide2.long]: longSnapshot
            ? {
                ...longSnapshot,
                ...longTradeLimitations,
                closed:
                  closedStatus.find((s) => getAddress(s.market) === ChainMarkets[chainId][asset]?.long)?.closed ??
                  false,
              }
            : undefined,
          [PositionSide2.short]: shortSnapshot
            ? {
                ...shortSnapshot,
                ...shortTradeLimitations,
                closed:
                  closedStatus.find((s) => getAddress(s.market) === ChainMarkets[chainId][asset]?.short)?.closed ??
                  false,
              }
            : undefined,
        }

        return acc
      }, {} as AssetSnapshots)
    },
  })
}

export const useUserCurrentPositions = () => {
  const chainId = useChainId()
  const { address } = useAddress()
  const userLens = useLensUserProductSnapshot()
  const { data: productSnapshots } = useChainAssetSnapshots()

  return useQuery({
    queryKey: ['userCurrentPositions', chainId, address],
    enabled: !!address && !!productSnapshots,
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      if (!address || !productSnapshots) return
      const assets = Object.keys(ChainMarkets[chainId]) as SupportedAsset[]
      const markets = assets
        .map((asset) => ChainMarkets[chainId][asset])
        .filter(notEmpty)
        .map((market) => [market.long, market.short].filter(notEmpty))
        .flat()

      const accountSnapshots = await userLens.read.snapshots([address, markets])
      return accountSnapshots
    },
  })
}
