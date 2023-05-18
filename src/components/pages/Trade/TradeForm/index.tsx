import { useState } from "react";
import { Container } from "@ds/Container";
import { OrderSide } from "./constants";

import TradeForm from "./components/TradeForm";
import ModifyPositionForm from "./components/ModifyPositionForm";
import { FormState, useTradeFormState } from "@/contexts/tradeFormContext";
import { useMarketContext } from "@/contexts/marketContext";
import { useResetFormOnMarketChange } from "./hooks";

const dummyData = {
  collateral: "0.000",
  asset: "ETH",
  amount: "0.000",
};

function TradeContainer() {
  const [orderSide, setOrderSide] = useState<OrderSide>(OrderSide.Long);
  const { formState, setTradeFormState } = useTradeFormState();
  const { assetMetadata, selectedMarket } = useMarketContext();
  // Reset to trade form when market changes
  useResetFormOnMarketChange({ setTradeFormState, selectedMarket, formState });

  const handleSubmitTrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("order submitted");
  };

  const handleModifyPosition = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("modify position");
  };

  const containerVariant = formState === FormState.modify ? "active" : "transparent";

  return (
    <Container height="100%" p="0" variant={containerVariant}>
      {formState === FormState.trade && (
        <TradeForm
          onSubmit={handleSubmitTrade}
          orderSide={orderSide}
          setOrderSide={setOrderSide}
          availableCollateral={dummyData.collateral}
          amount={dummyData.amount}
          assetMetadata={assetMetadata}
        />
      )}
      {formState === FormState.modify && (
        <ModifyPositionForm
          onSubmit={handleModifyPosition}
          orderSide={orderSide}
          setOrderSide={setOrderSide}
          availableCollateral={dummyData.collateral}
          amount={dummyData.amount}
          assetMetadata={assetMetadata}
        />
      )}
    </Container>
  );
}

export default TradeContainer;
