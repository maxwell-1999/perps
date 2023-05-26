import { createContext, useContext, useEffect, useState } from 'react'

import { OrderDirection } from '@/components/pages/Trade/TradeForm/constants'
import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { DefaultChain } from '@/constants/network'
import { SupportedChainId } from '@/constants/network'
import { AssetSnapshots, UserCurrentPositions, useChainAssetSnapshots } from '@/hooks/markets'
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
    long?: IPerennialLens.ProductSnapshotStructOutput
    short?: IPerennialLens.ProductSnapshotStructOutput
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
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.Long)
  const [activePositionTab, setActivePositionTab] = useState<PositionsTab>(PositionsTab.current)

  const { data: snapshots } = useChainAssetSnapshots()

  useEffect(() => {
    // check query params first
    const urlParams = new URLSearchParams(window.location.search)
    const marketFromParams = urlParams.get('market')?.toLowerCase()

    if (marketFromParams && Object.keys(SupportedAsset).includes(marketFromParams)) {
      _setSelectedMarket(marketFromParams as SupportedAsset)
    } else {
      // TODO: local storage key will include chain ID when we get there
      const marketFromLocalStorage = localStorage.getItem('market')

      if (marketFromLocalStorage && Object.keys(SupportedAsset).includes(marketFromLocalStorage)) {
        _setSelectedMarket(marketFromLocalStorage as SupportedAsset)
      }
    }
  }, [])

  const setSelectedMarket = (asset: SupportedAsset) => {
    localStorage.setItem('market', asset)
    _setSelectedMarket(asset)
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
