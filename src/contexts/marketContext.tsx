import { createContext, useContext, useEffect, useState } from 'react'

import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'
import { DefaultChain } from '@/constants/network'
import { SupportedChainId } from '@/constants/network'
import {
  AssetSnapshots,
  UserCurrentPositions,
  useChainAssetSnapshots,
  useRefreshMarketDataOnPriceUpdates,
} from '@/hooks/markets'
import { useChainId } from '@/hooks/network'

import { IPerennialLens } from '@t/generated/LensAbi'

export enum PositionsTab {
  current,
  all,
  history,
}

type MarketContextType = {
  chainId: SupportedChainId
  orderDirection: OrderDirection
  setOrderDirection: (orderDirection: OrderDirection) => void
  assetMetadata: (typeof AssetMetadata)[SupportedAsset]
  selectedMarket: SupportedAsset
  setSelectedMarket: (asset: SupportedAsset) => void
  snapshots?: AssetSnapshots
  positions?: UserCurrentPositions
  selectedMarketSnapshot?: {
    [OrderDirection.Long]?: IPerennialLens.ProductSnapshotStructOutput
    [OrderDirection.Short]?: IPerennialLens.ProductSnapshotStructOutput
  }
  activePositionTab: PositionsTab
  setActivePositionTab: (tab: PositionsTab) => void
}

const MarketContext = createContext<MarketContextType>({
  chainId: DefaultChain.id,
  orderDirection: OrderDirection.Long,
  setOrderDirection: (orderDirection: OrderDirection) => {
    orderDirection
  },
  selectedMarket: SupportedAsset.eth,
  assetMetadata: AssetMetadata[SupportedAsset.eth],
  setSelectedMarket: (asset: SupportedAsset) => {
    asset
  },
  snapshots: undefined,
  selectedMarketSnapshot: undefined,
  activePositionTab: PositionsTab.current,
  setActivePositionTab: (tab: PositionsTab) => {
    tab
  },
})

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId()
  const [selectedMarket, _setSelectedMarket] = useState<SupportedAsset>(SupportedAsset.eth)
  const [orderDirection, _setOrderDirection] = useState<OrderDirection>(OrderDirection.Long)
  const [activePositionTab, setActivePositionTab] = useState<PositionsTab>(PositionsTab.current)

  const { data: snapshots } = useChainAssetSnapshots()

  useRefreshMarketDataOnPriceUpdates()

  useEffect(() => {
    // check query params first
    const urlParams = new URLSearchParams(window.location.search)
    const marketFromParams = urlParams.get('market')?.toLowerCase()
    const directionFromParams = urlParams.get('direction')?.toLowerCase()

    if (marketFromParams && Object.keys(SupportedAsset).includes(marketFromParams)) {
      _setSelectedMarket(marketFromParams as SupportedAsset)
    } else {
      const marketFromLocalStorage = localStorage.getItem(`${chainId}_market`)

      if (marketFromLocalStorage && Object.keys(SupportedAsset).includes(marketFromLocalStorage)) {
        _setSelectedMarket(marketFromLocalStorage as SupportedAsset)
      }
    }

    if (directionFromParams && Object.keys(OrderDirection).includes(directionFromParams)) {
      _setOrderDirection(directionFromParams as OrderDirection)
    } else {
      const directionFromLocalStorage = localStorage.getItem(`${chainId}_orderDirection`)

      if (directionFromLocalStorage && Object.keys(OrderDirection).includes(directionFromLocalStorage)) {
        _setOrderDirection(directionFromLocalStorage as OrderDirection)
      }
    }
  }, [chainId])

  const setSelectedMarket = (asset: SupportedAsset) => {
    localStorage.setItem(`${chainId}_market`, asset)
    _setSelectedMarket(asset)
  }

  const setOrderDirection = (orderDirection: OrderDirection) => {
    localStorage.setItem(`${chainId}_orderDirection`, orderDirection)
    _setOrderDirection(orderDirection)
  }

  return (
    <MarketContext.Provider
      value={{
        chainId,
        orderDirection,
        setOrderDirection,
        selectedMarket,
        setSelectedMarket,
        snapshots,
        selectedMarketSnapshot: snapshots?.[selectedMarket],
        assetMetadata: AssetMetadata[selectedMarket],
        activePositionTab,
        setActivePositionTab,
      }}
    >
      {children}
    </MarketContext.Provider>
  )
}

export const useMarketContext = () => {
  const context = useContext(MarketContext)
  if (context === undefined) {
    throw new Error('useMarketContext must be used within a MarketProvider')
  }
  return context
}
