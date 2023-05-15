import { createContext, useState, useContext, useEffect } from "react";
import { L2SupportedAsset } from "@/constants/currencies";

// TODO: How do we think about novel markets like milli-squeeth in this context?
const MarketContext = createContext({
  selectedMarket: L2SupportedAsset.eth,
  setSelectedMarket: (asset: L2SupportedAsset) => {
    asset;
  },
});

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMarket, _setSelectedMarket] = useState(L2SupportedAsset.eth);

  useEffect(() => {
    // check query params first
    const urlParams = new URLSearchParams(window.location.search);
    const marketFromParams = urlParams.get("market")?.toLowerCase();

    if (marketFromParams && Object.keys(L2SupportedAsset).includes(marketFromParams)) {
      _setSelectedMarket(marketFromParams as L2SupportedAsset);
    } else {
      // TODO: local storage key will include chain ID when we get there
      const marketFromLocalStorage = localStorage.getItem("market");

      if (
        marketFromLocalStorage &&
        Object.keys(L2SupportedAsset).includes(marketFromLocalStorage)
      ) {
        _setSelectedMarket(marketFromLocalStorage as L2SupportedAsset);
      }
    }
  }, []);

  const setSelectedMarket = (asset: L2SupportedAsset) => {
    _setSelectedMarket(asset);
  };

  return (
    <MarketContext.Provider value={{ selectedMarket, setSelectedMarket }}>
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
