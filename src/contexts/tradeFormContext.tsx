import { createContext, useState, useContext } from "react";

export enum TradeFormOverlayStates {
  close = "close",
  modify = "modify",
  withdraw = "withdraw",
  add = "add",
  none = "",
}

const TradeFormOverlayContext = createContext({
  tradeFormOverlay: TradeFormOverlayStates.none,
  setTradeFormOverlay: (state: TradeFormOverlayStates) => {
    state;
  },
});

export const TradeFormProvider = ({ children }: { children: React.ReactNode }) => {
  const [tradeFormOverlay, _setTradeFormOverlay] = useState(TradeFormOverlayStates.none);
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
