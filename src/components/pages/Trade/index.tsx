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

const NavBar = dynamic(() => import("@/components/shared/NavBar"), {
  ssr: false,
});

export default function Trade() {
  const isBase = useBreakpointValue({ base: true, md: false });
  return (
    <TradeLayout>
      <HeaderGridItem>
        <NavBar />
      </HeaderGridItem>
      {!isBase && (
        <MarketBarGridItem>
          <Container height="100%">Market Bar</Container>
        </MarketBarGridItem>
      )}
      <TradeFormGridItem>
        <Container height="100%">Trade Form</Container>
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
  );
}
