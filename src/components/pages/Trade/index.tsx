import { Container, useBreakpointValue } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { TradeFormProvider } from "@/contexts/tradeFormContext";
import { MarketProvider } from "@/contexts/marketContext";
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
import Chart from "./Chart";

const NavBar = dynamic(() => import("@/components/shared/NavBar"), {
  ssr: false,
});

const POSITION_MANAGER = "Position Manager";

export default function Trade() {
  const isBase = useBreakpointValue({ base: true, md: false });
  return (
    <MarketProvider>
      <TradeFormProvider>
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
                <Chart />
              </ChartGridItem>
              <PositionManagerGridItem>
                <Container height="100%">{POSITION_MANAGER}</Container>
              </PositionManagerGridItem>
            </>
          )}
        </TradeLayout>
      </TradeFormProvider>
    </MarketProvider>
  );
}
