import { GridItem, useColorModeValue } from '@chakra-ui/react'
import styled from '@emotion/styled'

import colors from '@ds/theme/colors'
import { breakpoints } from '@ds/theme/styles'

const mobileLayout = `
  "header"
  "vaultDetail"
`

const desktopLayout = `
  "header header"
  "vaultSelect vaultDetail"
`

const GridContainer = styled.div`
  display: grid;
  min-height: 100dvh;

  grid-template-areas: ${mobileLayout};
  grid-template-columns: 1fr;
  grid-template-rows: 86px 1fr;

  @media (min-width: ${breakpoints.md}) {
    grid-template-areas: ${desktopLayout};
    grid-template-columns: 330px 1fr;
    grid-template-rows: 86px 1fr;
  }
`

export const EarnLayout: React.FC<GridItemProps> = ({ children }) => {
  return <GridContainer>{children}</GridContainer>
}

interface GridItemProps {
  children: React.ReactNode
}

export const HeaderGridItem: React.FC<GridItemProps> = ({ children }) => {
  const borderColor = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  return (
    <GridItem gridArea="header" borderBottom={`1px solid ${borderColor}`} padding="1.2rem">
      {children}
    </GridItem>
  )
}

export const VaultSelectGridItem: React.FC<GridItemProps> = ({ children }) => {
  return <GridItem gridArea="vaultSelect">{children}</GridItem>
}

export const VaultDetailGridItem: React.FC<GridItemProps> = ({ children }) => {
  return <GridItem gridArea="vaultDetail">{children}</GridItem>
}
