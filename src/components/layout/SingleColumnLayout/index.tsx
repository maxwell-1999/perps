import { GridItem, useColorModeValue } from '@chakra-ui/react'
import styled from '@emotion/styled'

import colors from '@ds/theme/colors'

const mobileLayout = `
  "header"
  "body"
`

const GridContainer = styled.div`
  display: grid;
  min-height: 100dvh;

  grid-template-areas: ${mobileLayout};
  grid-template-columns: 1fr;
  grid-template-rows: 44px 1fr;
`
interface GridItemProps {
  children: React.ReactNode
}

export const SingleColumnLayout: React.FC<GridItemProps> = ({ children }) => {
  return <GridContainer>{children}</GridContainer>
}

export const HeaderGridItem: React.FC<GridItemProps> = ({ children }) => {
  const borderColor = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  return (
    <GridItem gridArea="header" borderBottom={`1px solid ${borderColor}`} padding="1.2rem">
      {children}
    </GridItem>
  )
}

export const BodyGridItem: React.FC<GridItemProps> = ({ children }) => {
  return <GridItem gridArea="body">{children}</GridItem>
}
