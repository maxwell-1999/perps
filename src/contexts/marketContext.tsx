import { createContext, useContext, useEffect, useState } from 'react'

import { AdjustmentModalProps } from '@/components/pages/Trade/TradeForm/components/AdjustPositionModal'
import { AssetMetadata, ChainMarkets2, PositionSide2, SupportedAsset } from '@/constants/markets'
import { DefaultChain } from '@/constants/network'
import { SupportedChainId } from '@/constants/network'
import { MarketSnapshot, MarketSnapshots, UserMarketSnapshot, useMarketSnapshots2 } from '@/hooks/markets2'
import { useChainId } from '@/hooks/network'

export enum PositionsTab {
  current,
  all,
  history,
}

export type OverrideValues = Pick<
  AdjustmentModalProps,
  'market' | 'position' | 'asset' | 'orderValues' | 'positionSide' | 'positionDelta'
>

type MarketContextType = {
  chainId: SupportedChainId
  orderDirection: PositionSide2.long | PositionSide2.short
  setOrderDirection: (orderDirection: PositionSide2.long | PositionSide2.short) => void
  assetMetadata: (typeof AssetMetadata)[SupportedAsset]
  selectedMarket: SupportedAsset
  setSelectedMarket: (asset: SupportedAsset) => void
  selectedMakerMarket: SupportedAsset
  setSelectedMakerMarket: (makerMarket: SupportedAsset) => void
  activePositionTab: PositionsTab
  setActivePositionTab: (tab: PositionsTab) => void
  isMaker: boolean
  // V2
  snapshots2?: MarketSnapshots
  userCurrentPosition?: UserMarketSnapshot
  selectedMarketSnapshot2?: MarketSnapshot
  setOverrideValues: (overrideValues?: OverrideValues) => void
  overrideValues?: OverrideValues
  manualCommitment: boolean
}

const MarketContext = createContext<MarketContextType>({
  chainId: DefaultChain.id,
  orderDirection: PositionSide2.long,
  setOrderDirection: (orderDirection: PositionSide2.long | PositionSide2.short) => {
    orderDirection
  },
  selectedMarket: SupportedAsset.eth,
  assetMetadata: AssetMetadata[SupportedAsset.eth],
  setSelectedMarket: (asset: SupportedAsset) => {
    asset
  },
  setSelectedMakerMarket: (makerMarket: SupportedAsset) => {
    makerMarket
  },
  selectedMakerMarket: SupportedAsset.eth,
  activePositionTab: PositionsTab.current,
  setActivePositionTab: (tab: PositionsTab) => {
    tab
  },
  isMaker: false,
  // V2
  snapshots2: undefined,
  userCurrentPosition: undefined,
  selectedMarketSnapshot2: undefined,
  setOverrideValues: (overrideValues?: OverrideValues) => {
    overrideValues
  },
  overrideValues: undefined,
  manualCommitment: false,
})

export const MarketProvider = ({ children, isMaker }: { children: React.ReactNode; isMaker?: boolean }) => {
  const chainId = useChainId()
  const [selectedMarket, _setSelectedMarket] = useState<SupportedAsset>(SupportedAsset.eth)
  const [selectedMakerMarket, _setSelectedMakerMarket] = useState<SupportedAsset>(SupportedAsset.eth)
  const [orderDirection, _setOrderDirection] = useState<PositionSide2.long | PositionSide2.short>(PositionSide2.long)
  const [activePositionTab, setActivePositionTab] = useState<PositionsTab>(PositionsTab.current)
  const [overrideValues, setOverrideValues] = useState<OverrideValues | undefined>(undefined)
  const [manualCommitment, setManualCommitment] = useState<boolean>(false)

  const { data: snapshots2 } = useMarketSnapshots2()

  useEffect(() => {
    // check query params first
    const urlParams = new URLSearchParams(window.location.search)
    const marketFromParams = urlParams.get('market')?.toLowerCase()
    const makerMarketFromParams = urlParams.get('makerMarket')?.toLowerCase() as SupportedAsset
    const directionFromParams = urlParams.get('direction')?.toLowerCase()
    const manualCommitmentFromParams = urlParams.get('manualCommitment')?.toLowerCase()

    if (manualCommitmentFromParams === 'true' && !manualCommitment) setManualCommitment(true)

    if (marketFromParams && marketFromParams in ChainMarkets2[chainId]) {
      _setSelectedMarket(marketFromParams as SupportedAsset)
    } else {
      const marketFromLocalStorage = localStorage.getItem(`${chainId}_market`)
      const makerMarketFromLocalStorage = localStorage.getItem(`${chainId}_makerMarket`)

      if (marketFromLocalStorage && marketFromLocalStorage in ChainMarkets2[chainId]) {
        _setSelectedMarket(marketFromLocalStorage as SupportedAsset)
      }

      if (makerMarketFromLocalStorage && makerMarketFromLocalStorage in ChainMarkets2[chainId]) {
        _setSelectedMakerMarket(makerMarketFromLocalStorage as SupportedAsset)
      }
    }

    if (makerMarketFromParams && makerMarketFromParams in ChainMarkets2[chainId]) {
      _setSelectedMakerMarket(makerMarketFromParams as SupportedAsset)
    }

    if (
      directionFromParams &&
      [PositionSide2.long, PositionSide2.short].includes(directionFromParams as PositionSide2)
    ) {
      _setOrderDirection(directionFromParams as PositionSide2.long | PositionSide2.short)
    } else {
      const directionFromLocalStorage = localStorage.getItem(`${chainId}_orderDirection`)

      if (
        directionFromLocalStorage &&
        [PositionSide2.long, PositionSide2.short].includes(directionFromLocalStorage as PositionSide2)
      ) {
        _setOrderDirection(directionFromLocalStorage as PositionSide2.long | PositionSide2.short)
      }
    }

    if (!(selectedMarket in ChainMarkets2[chainId])) {
      _setSelectedMarket((Object.keys(ChainMarkets2[chainId])[0] as SupportedAsset) ?? SupportedAsset.eth)
    }

    if (!(selectedMakerMarket in ChainMarkets2[chainId])) {
      _setSelectedMakerMarket(SupportedAsset.eth)
    }
  }, [chainId, selectedMarket, snapshots2, selectedMakerMarket, isMaker, manualCommitment])

  const setSelectedMarket = (asset: SupportedAsset) => {
    localStorage.setItem(`${chainId}_market`, asset)
    _setSelectedMarket(asset)
  }

  const setSelectedMakerMarket = (makerMarket: SupportedAsset) => {
    localStorage.setItem(`${chainId}_makerMarket`, makerMarket)
    _setSelectedMakerMarket(makerMarket)
  }

  const setOrderDirection = (orderDirection: PositionSide2.long | PositionSide2.short) => {
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
        snapshots2,
        assetMetadata: AssetMetadata[isMaker ? selectedMakerMarket : selectedMarket],
        activePositionTab,
        setActivePositionTab,
        setSelectedMakerMarket,
        selectedMakerMarket,
        isMaker: isMaker ?? false,
        userCurrentPosition: snapshots2?.user?.[isMaker ? selectedMakerMarket : selectedMarket],
        selectedMarketSnapshot2: snapshots2?.market?.[isMaker ? selectedMakerMarket : selectedMarket],
        setOverrideValues,
        overrideValues,
        manualCommitment,
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
