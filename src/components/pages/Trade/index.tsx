import {
  ChartGridItem,
  HeaderGridItem,
  MarketBarGridItem,
  PositionManagerGridItem,
  TradeFormGridItem,
  TradeLayout,
} from "@/components/layout/TradeLayout";
import { Container, useBreakpointValue } from "@chakra-ui/react";

export default function Trade() {
  const isBase = useBreakpointValue({ base: true, md: false });
  return (
    <TradeLayout>
      <HeaderGridItem>
        <Container height="100%">Header</Container>
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
