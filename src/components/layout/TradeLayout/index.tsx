import { GridItem } from '@chakra-ui/react'
import styled from '@emotion/styled'

import colors from '@ds/theme/colors'
import { breakpoints } from '@ds/theme/styles'

const mobileLayout = `
  "header"
  "marketBar"
  "chart"
  "mobileTradeButtons"
`

const desktopLayout = `
  "header header"
  "marketBar tradeForm"
  "chart tradeForm"
  "positionManager tradeForm"
`

const GridContainer = styled.div<{ isMaker?: boolean }>`
  display: grid;
  grid-gap: 0px;
  min-height: 100dvh;
  width: 100%;
  padding: 0rem;
  grid-template-areas: ${mobileLayout};
  grid-template-columns: 1fr;
  grid-template-rows: 54px 54px 1fr 48px;
  background-color: #1c1c28;
  @media (min-width: ${breakpoints.md}) {
    grid-template-areas: ${desktopLayout};
    grid-template-columns: 1fr 304px;
    grid-template-rows: 54px 54px 1fr 230px;
  }

  @media (min-width: ${breakpoints.xl}) {
    grid-template-columns: 1fr 275px;
    grid-template-rows: auto auto 1fr 320px;
  }
`

const DesktopOnlyGridItem = styled(GridItem)`
  display: none;
  @media (min-width: ${breakpoints.md}) {
    display: initial;
  }
`

const MobileFixedGridItem = styled(GridItem)`
  display: grid;
  background: ${colors.brand.blackAlpha[80]};
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 79px;
  z-index: 1;
  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
`

interface LayoutProps {
  children: React.ReactNode
  isMaker?: boolean
}

export const TradeLayout: React.FC<LayoutProps> = ({ children, isMaker }) => {
  return (
    <GridContainer isMaker={isMaker} id="root-layout-div">
      {children}
    </GridContainer>
  )
}

interface GridItemProps {
  children: React.ReactNode
  gridArea?: string
  desktopOnly?: boolean
}

export const FlexibleGridItem: React.FC<GridItemProps> = ({ children, gridArea, desktopOnly }) => {
  if (desktopOnly) {
    return (
      <DesktopOnlyGridItem className="bg-transparent " gridArea={gridArea}>
        {children}
      </DesktopOnlyGridItem>
    )
  }
  return <GridItem gridArea={gridArea}>{children}</GridItem>
}

export const HeaderGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="header">{children}</GridItem>
)

export const MarketBarGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="marketBar">{children}</GridItem>
)

export const ChartGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="chart" className="!px-gapbw">
    {children}
  </GridItem>
)

export const PositionManagerGridItem: React.FC<GridItemProps> = ({ children }) => (
  <GridItem gridArea="positionManager" className="!bg-[#1c1c28] px-gapbw">
    {children}
  </GridItem>
)

export const MobileTradeButtonsGridItem: React.FC<GridItemProps> = ({ children }) => (
  <MobileFixedGridItem gridArea="mobileTradeButtons" className="!bg-[#1c1c28] !p-1">
    {children}
  </MobileFixedGridItem>
)

// ctoaddtw
// 141823j
// 171722
// 1c1c28
