import { createContext, useContext, useEffect, useState } from 'react'

import { AssetMetadata, SupportedAsset, SupportedMakerMarket } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'
import { ChainMarkets } from '@/constants/markets'
import { DefaultChain } from '@/constants/network'
import { SupportedChainId } from '@/constants/network'
import {
  AssetSnapshots,
  ProductSnapshotWithTradeLimitations,
  useChainAssetSnapshots,
  useRefreshKeysOnPriceUpdates,
} from '@/hooks/markets'
import { useChainId } from '@/hooks/network'
import { getMakerAssetAndDirection } from '@/utils/makerMarketUtils'

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
  selectedMakerMarket: SupportedMakerMarket
  setSelectedMakerMarket: (makerMarket: SupportedMakerMarket) => void
  snapshots?: AssetSnapshots
  selectedMarketSnapshot?: {
    [OrderDirection.Long]?: ProductSnapshotWithTradeLimitations
    [OrderDirection.Short]?: ProductSnapshotWithTradeLimitations
  }
  selectedMakerMarketSnapshot?: ProductSnapshotWithTradeLimitations
  activePositionTab: PositionsTab
  setActivePositionTab: (tab: PositionsTab) => void
  isMaker: boolean
  makerAsset: SupportedAsset
  makerOrderDirection: OrderDirection
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
  setSelectedMakerMarket: (makerMarket: SupportedMakerMarket) => {
    makerMarket
  },
  selectedMakerMarket: SupportedMakerMarket.ethLong,
  snapshots: undefined,
  selectedMarketSnapshot: undefined,
  selectedMakerMarketSnapshot: undefined,
  activePositionTab: PositionsTab.current,
  setActivePositionTab: (tab: PositionsTab) => {
    tab
  },
  isMaker: false,
  makerAsset: SupportedAsset.eth,
  makerOrderDirection: OrderDirection.Long,
})

export const MarketProvider = ({ children, isMaker }: { children: React.ReactNode; isMaker?: boolean }) => {
  const chainId = useChainId()
  const [selectedMarket, _setSelectedMarket] = useState<SupportedAsset>(SupportedAsset.eth)
  const [selectedMakerMarket, _setSelectedMakerMarket] = useState<SupportedMakerMarket>(SupportedMakerMarket.ethLong)
  const [orderDirection, _setOrderDirection] = useState<OrderDirection>(OrderDirection.Long)
  const [activePositionTab, setActivePositionTab] = useState<PositionsTab>(PositionsTab.current)

  const { data: snapshots } = useChainAssetSnapshots()
  const { asset: makerAsset, orderDirection: makerOrderDirection } = getMakerAssetAndDirection(selectedMakerMarket)

  useRefreshKeysOnPriceUpdates()

  useEffect(() => {
    // check query params first
    const urlParams = new URLSearchParams(window.location.search)
    const marketFromParams = urlParams.get('market')?.toLowerCase()
    const makerMarketFromParams = urlParams.get('makerMarket')?.toLowerCase()
    const directionFromParams = urlParams.get('direction')?.toLowerCase()

    if (marketFromParams && Object.keys(SupportedAsset).includes(marketFromParams)) {
      _setSelectedMarket(marketFromParams as SupportedAsset)
    } else {
      const marketFromLocalStorage = localStorage.getItem(`${chainId}_market`)
      const makerMarketFromLocalStorage = localStorage.getItem(`${chainId}_makerMarket`)

      if (marketFromLocalStorage && Object.keys(SupportedAsset).includes(marketFromLocalStorage)) {
        _setSelectedMarket(marketFromLocalStorage as SupportedAsset)
      }

      if (makerMarketFromLocalStorage && Object.keys(SupportedMakerMarket).includes(makerMarketFromLocalStorage)) {
        _setSelectedMakerMarket(makerMarketFromLocalStorage as SupportedMakerMarket)
      }
    }

    if (makerMarketFromParams && Object.keys(SupportedMakerMarket).includes(makerMarketFromParams)) {
      _setSelectedMakerMarket(makerMarketFromParams as SupportedMakerMarket)
    }

    if (directionFromParams && Object.keys(OrderDirection).includes(directionFromParams)) {
      _setOrderDirection(directionFromParams as OrderDirection)
    } else {
      const directionFromLocalStorage = localStorage.getItem(`${chainId}_orderDirection`)

      if (directionFromLocalStorage && Object.keys(OrderDirection).includes(directionFromLocalStorage)) {
        _setOrderDirection(directionFromLocalStorage as OrderDirection)
      }
    }

    if (!(selectedMarket in ChainMarkets[chainId])) {
      _setSelectedMarket(Object.keys(ChainMarkets[chainId])[0] as SupportedAsset)
    }

    if (!(makerAsset in ChainMarkets[chainId])) {
      _setSelectedMakerMarket(SupportedMakerMarket.ethLong)
    }
  }, [chainId, selectedMarket, makerAsset])

  const setSelectedMarket = (asset: SupportedAsset) => {
    localStorage.setItem(`${chainId}_market`, asset)
    _setSelectedMarket(asset)
  }

  const setSelectedMakerMarket = (makerMarket: SupportedMakerMarket) => {
    localStorage.setItem(`${chainId}_makerMarket`, makerMarket)
    _setSelectedMakerMarket(makerMarket)
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
        selectedMakerMarketSnapshot: snapshots?.[makerAsset]?.[makerOrderDirection],
        assetMetadata: AssetMetadata[isMaker ? makerAsset : selectedMarket],
        activePositionTab,
        setActivePositionTab,
        setSelectedMakerMarket,
        selectedMakerMarket,
        isMaker: isMaker ?? false,
        makerAsset,
        makerOrderDirection,
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
