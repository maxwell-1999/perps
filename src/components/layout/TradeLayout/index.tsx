import { GridItem } from '@chakra-ui/react'
import styled from '@emotion/styled'

import { breakpoints } from '@ds/theme/styles'

const mobileLayout = `
  "header"
  "marketBar"
  "tradeForm"
`

const desktopLayout = `
  "header header"
  "marketBar marketBar"
  "tradeForm chart"
  "tradeForm positionManager"
`

const largeScreenLayout = `
  "header header"
  "marketBar marketBar"
  "tradeForm chart"
  ". positionManager"
`

const GridContainer = styled.div`
  display: grid;
  grid-gap: 15px;
  min-height: 100vh;
  width: 100%;
  padding: 1.2rem;

  grid-template-areas: ${mobileLayout};
  grid-template-columns: 1fr;
  grid-template-rows: 54px 54px 1fr;

  @media (min-width: ${breakpoints.md}) {
    grid-template-areas: ${desktopLayout};
    grid-template-columns: 304px 1fr;
    grid-template-rows: 54px 54px 1fr 230px;
  }

  @media (min-width: ${breakpoints.xl}) {
    grid-template-areas: ${largeScreenLayout};
    grid-template-columns: 304px 1fr;
    grid-template-rows: 54px 54px 1fr 230px;
  }
`
interface LayoutProps {
  children: React.ReactNode
}

export const TradeLayout: React.FC<LayoutProps> = ({ children }) => {
  return <GridContainer>{children}</GridContainer>
}

interface GridItemProps {
  children: React.ReactNode
}

export const HeaderGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="header">{children}</GridItem>
)

export const MarketBarGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="marketBar">{children}</GridItem>
)

export const TradeFormGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="tradeForm">{children}</GridItem>
)

export const ChartGridItem: React.FC<GridItemProps> = ({ children }) => <GridItem gridArea="chart">{children}</GridItem>

export const PositionManagerGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="positionManager">{children}</GridItem>
)
