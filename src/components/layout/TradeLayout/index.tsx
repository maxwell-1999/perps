import { Grid, GridItem, GridProps, useBreakpointValue } from "@chakra-ui/react";
// NOTE: Reference TradeLayout.stories.tsx for usage
const mobileLayout = `
  "header"
  "tradeForm"
`;

const desktopLayout = `
  "header header "
  "marketBar marketBar"
  "tradeForm chart"
  "tradeForm positionManager"
`;

interface LayoutProps extends GridProps {
  children: React.ReactNode;
}

export const TradeLayout: React.FC<LayoutProps> = ({ children, ...props }) => {
  const templateAreas = useBreakpointValue({
    base: mobileLayout,
    md: desktopLayout,
  });

  const gridTemplateColumns = useBreakpointValue({
    base: "1fr",
    md: "304px 1fr",
  });

  const gridTemplateRows = useBreakpointValue({
    base: "54px 1fr",
    md: "54px 54px 1fr 0.7fr",
  });

  return (
    <Grid
      gap="15px"
      minHeight="100vh"
      w="100%"
      p="1rem"
      templateAreas={templateAreas}
      gridTemplateColumns={gridTemplateColumns}
      gridTemplateRows={gridTemplateRows}
      {...props}
    >
      {children}
    </Grid>
  );
};

interface GridItemProps {
  children: React.ReactNode;
}

export const HeaderGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="header">{children}</GridItem>
);

export const MarketBarGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="marketBar">{children}</GridItem>
);

export const TradeFormGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="tradeForm">{children}</GridItem>
);

export const ChartGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="chart">{children}</GridItem>
);

export const PositionManagerGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="positionManager">{children}</GridItem>
);
