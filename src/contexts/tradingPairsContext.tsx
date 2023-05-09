import React, { createContext, useState, useContext } from "react";

const TradingPairsContext = createContext({
  showTradingPairs: false,
  toggleTradingPairs: () => {},
});

export const TradingPairsProvider = ({ children }: { children: React.ReactNode }) => {
  const [showTradingPairs, setShowTradingPairs] = useState(false);

  const toggleTradingPairs = () => {
    setShowTradingPairs((prevState) => !prevState);
  };

  return (
    <TradingPairsContext.Provider value={{ showTradingPairs, toggleTradingPairs }}>
      {children}
    </TradingPairsContext.Provider>
  );
};

export const useTradingPairs = () => {
  const context = useContext(TradingPairsContext);
  if (context === undefined) {
    throw new Error("useTradingPairs must be used within a TradingPairsProvider");
  }
  return context;
};
