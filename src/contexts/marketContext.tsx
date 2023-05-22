import { createContext, useState, useEffect, useContext } from "react";
import { DefaultChain } from "@/constants/network";
import { SupportedAsset, AssetMetadata } from "@/constants/assets";
import {
  AssetSnapshots,
  UserCurrentPositions,
  useAsset24hrData,
  useChainAssetSnapshots,
  useUserCurrentPositions,
} from "@/hooks/markets";
import { IPerennialLens } from "@t/generated/LensAbi";
import { useChainId } from "@/hooks/network";
import { SupportedChainId } from "@/constants/network";
import { Get24hrDataQuery } from "@t/gql/graphql";

type MarketContextType = {
  chainId: SupportedChainId;
  assetMetadata: (typeof AssetMetadata)[SupportedAsset];
  selectedMarket: SupportedAsset;
  setSelectedMarket: (asset: SupportedAsset) => void;
  snapshots?: AssetSnapshots;
  positions?: UserCurrentPositions;
  selectedMarketSnapshot?: {
    long?: IPerennialLens.ProductSnapshotStructOutput;
    short?: IPerennialLens.ProductSnapshotStructOutput;
  };
  selectedMarketDailyData?: Get24hrDataQuery;
};

const MarketContext = createContext<MarketContextType>({
  chainId: DefaultChain.id,
  selectedMarket: SupportedAsset.eth,
  assetMetadata: AssetMetadata[SupportedAsset.eth],
  setSelectedMarket: (asset: SupportedAsset) => {
    asset;
  },
  snapshots: undefined,
  selectedMarketSnapshot: undefined,
  selectedMarketDailyData: undefined,
});

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId();
  const [selectedMarket, _setSelectedMarket] = useState<SupportedAsset>(SupportedAsset.eth);
  const { data: snapshots } = useChainAssetSnapshots();
  const { data: dailyData } = useAsset24hrData(selectedMarket);
  const { data: positions } = useUserCurrentPositions();

  useEffect(() => {
    // check query params first
    const urlParams = new URLSearchParams(window.location.search);
    const marketFromParams = urlParams.get("market")?.toLowerCase();

    if (marketFromParams && Object.keys(SupportedAsset).includes(marketFromParams)) {
      _setSelectedMarket(marketFromParams as SupportedAsset);
    } else {
      // TODO: local storage key will include chain ID when we get there
      const marketFromLocalStorage = localStorage.getItem("market");

      if (marketFromLocalStorage && Object.keys(SupportedAsset).includes(marketFromLocalStorage)) {
        _setSelectedMarket(marketFromLocalStorage as SupportedAsset);
      }
    }
  }, []);

  const setSelectedMarket = (asset: SupportedAsset) => {
    localStorage.setItem("market", asset);
    _setSelectedMarket(asset);
  };

  return (
    <MarketContext.Provider
      value={{
        chainId,
        selectedMarket,
        setSelectedMarket,
        snapshots,
        selectedMarketSnapshot: snapshots?.[selectedMarket],
        selectedMarketDailyData: dailyData,
        assetMetadata: AssetMetadata[selectedMarket],
        positions,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarketContext = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error("useMarketContext must be used within a MarketProvider");
  }
  return context;
};
