import type { Meta, StoryObj } from "@storybook/react";
import { HeaderGridItem, MarketBarGridItem, TradeLayout } from "./index";
import { Container } from "../../design-system/Container";
import { GridItem, useBreakpointValue } from "@chakra-ui/react";

const meta: Meta<typeof TradeLayout> = {
  title: "Perennial/TradeLayout",
  component: TradeLayout,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TradeLayout>;

export const Default: Story = () => {
  const isBase = useBreakpointValue({ base: true, md: false });
  // Offset layout height to account for the header
  return (
    <TradeLayout height="calc(100vh - 40px)">
      <HeaderGridItem>
        <Container height="100%">Header</Container>
      </HeaderGridItem>
      <GridItem gridArea="tradeForm">
        <Container height="100%">Trade Form</Container>
      </GridItem>
      {!isBase && (
        <>
          <MarketBarGridItem>
            <Container height="100%">Market Bar</Container>
          </MarketBarGridItem>
          <GridItem gridArea="chart">
            <Container height="100%">Chart</Container>
          </GridItem>
          <GridItem gridArea="positionManager">
            <Container height="100%">Position Manager</Container>
          </GridItem>
        </>
      )}
    </TradeLayout>
  );
};

Default.parameters = {
  nextRouter: {
    path: "/Trade",
  },
};
