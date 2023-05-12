import React, { createContext, useState, useContext } from "react";

export enum TradeFormOverlayStates {
  close = "close",
  modify = "modify",
  withdraw = "withdraw",
  add = "add",
  hide = "",
}

const TradeFormOverlayContext = createContext({
  tradeFormOverlay: TradeFormOverlayStates.hide,
  setTradeFormOverlay: (state: TradeFormOverlayStates) => {
    state;
  },
});

export const TradeFormProvider = ({ children }: { children: React.ReactNode }) => {
  const [tradeFormOverlay, _setTradeFormOverlay] = useState(TradeFormOverlayStates.hide);
  useState(tradeFormOverlay);

  const setTradeFormOverlay = (state: TradeFormOverlayStates) => {
    _setTradeFormOverlay(state);
  };

  return (
    <TradeFormOverlayContext.Provider value={{ tradeFormOverlay, setTradeFormOverlay }}>
      {children}
    </TradeFormOverlayContext.Provider>
  );
};

export const useTradeFormOverlay = () => {
  const context = useContext(TradeFormOverlayContext);
  if (context === undefined) {
    throw new Error("usetradeFormOverlay must be used within a TradeFormProvider");
  }
  return context;
};
