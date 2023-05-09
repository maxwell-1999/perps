import { Container, useBreakpointValue } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import {
  ChartGridItem,
  HeaderGridItem,
  MarketBarGridItem,
  PositionManagerGridItem,
  TradeFormGridItem,
  TradeLayout,
} from "@/components/layout/TradeLayout";
import MarketBar from "./MarketBar";
import TradeForm from "./TradeForm";
import { TradingPairsProvider } from "@/contexts/tradingPairsContext";

const NavBar = dynamic(() => import("@/components/shared/NavBar"), {
  ssr: false,
});

export default function Trade() {
  const isBase = useBreakpointValue({ base: true, sm: false });
  return (
    <TradingPairsProvider>
      <TradeLayout>
        <HeaderGridItem>
          <NavBar />
        </HeaderGridItem>
        <MarketBarGridItem>
          <MarketBar />
        </MarketBarGridItem>
        <TradeFormGridItem>
          <TradeForm />
        </TradeFormGridItem>
        {!isBase && (
          <>
            <ChartGridItem>
              <Container height="100%">Chart</Container>
            </ChartGridItem>
            <PositionManagerGridItem>
              <Container height="100%">Position Manager</Container>
            </PositionManagerGridItem>
          </>
        )}
      </TradeLayout>
    </TradingPairsProvider>
  );
}
