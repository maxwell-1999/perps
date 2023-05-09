import { Container } from "@ds/Container";
import { useTradingPairs } from "@/contexts/tradingPairsContext";
function TradeForm() {
  const { showTradingPairs } = useTradingPairs();

  return <Container height="100%">{showTradingPairs ? "Pair list" : "Trade Form"}</Container>;
}

export default TradeForm;
