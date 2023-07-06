import { Flex } from '@chakra-ui/react'
import styled from '@emotion/styled'

import { breakpoints } from '@/components/design-system/theme/styles'

export const DashedLine = styled.span<{ color: string }>`
  height: 20px;
  width: 16px;
  background: ${({ color }) => `repeating-linear-gradient(90deg, ${color} 0 5px, #000000 0 7px) center`};
  background-size: 100% 1px;
  background-repeat: no-repeat;
`

export const MarketInfoContent = styled(Flex)`
  flex: 1;
  padding: 16px;
  gap: 3%;
  max-height: 350px;
  width: 100%;

  @media (min-width: ${breakpoints.xl}) {
    max-width: 70%;
    gap: 4%;
  }
`
