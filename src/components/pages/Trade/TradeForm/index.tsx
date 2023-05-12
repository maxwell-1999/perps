import { useState } from "react";
import { Container } from "@ds/Container";
import { OrderSide } from "./constants";

import TradeForm from "./components/TradeForm";

const dummyData = {
  collateral: "0.000",
  asset: "ETH",
  amount: "0.000",
};

function TradeContainer() {
  const [orderSide, setOrderSide] = useState<OrderSide>(OrderSide.Long);

  return (
    <Container height="100%" p="0" position="relative">
      <TradeForm
        orderSide={orderSide}
        setOrderSide={setOrderSide}
        asset={dummyData.asset}
        availableCollateral={dummyData.collateral}
        amount={dummyData.amount}
      />
    </Container>
  );
}

export default TradeContainer;
