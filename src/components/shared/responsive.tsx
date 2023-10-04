import { Flex } from '@chakra-ui/react'
import styled from '@emotion/styled'

import { breakpoints } from '../design-system/theme/styles'

export const HiddenOnDesktop = styled(Flex)`
  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
`

export const HiddenOnMobile = styled(Flex)`
  @media (max-width: ${breakpoints.md}) {
    display: none;
  }
`
