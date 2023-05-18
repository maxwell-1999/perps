import { createContext, useState, useContext } from "react";

export enum FormState {
  trade = "trade",
  close = "close",
  modify = "modify",
  withdraw = "withdraw",
  add = "add",
}

const TradeFormOverlayContext = createContext({
  formState: FormState.trade,
  setTradeFormState: (state: FormState) => {
    state;
  },
});

export const TradeFormProvider = ({ children }: { children: React.ReactNode }) => {
  const [formState, _setTradeFormState] = useState(FormState.trade);

  const setTradeFormState = (state: FormState) => {
    _setTradeFormState(state);
  };

  return (
    <TradeFormOverlayContext.Provider value={{ formState, setTradeFormState }}>
      {children}
    </TradeFormOverlayContext.Provider>
  );
};

export const useTradeFormState = () => {
  const context = useContext(TradeFormOverlayContext);
  if (context === undefined) {
    throw new Error("useTradeFormState must be used within a TradeFormProvider");
  }
  return context;
};
