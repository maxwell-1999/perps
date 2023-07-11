import { Divider, Flex, FlexProps, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'

import colors from '@/components/design-system/theme/colors'

import { breakpoints } from '@ds/theme/styles'

export const MarketContainer: React.FC<FlexProps> = ({ children, ...props }) => (
  <Flex height="100%" alignItems="center" mr={8} {...props}>
    {children}
  </Flex>
)

export const Stat: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <Flex flexDirection="column">
    <Text whiteSpace="nowrap" fontSize="12px" color={colors.brand.whiteAlpha[50]}>
      {label}
    </Text>
    <Text color={valueColor} whiteSpace="nowrap">
      {value}
    </Text>
  </Flex>
)

export const ResponsiveFlex = styled(Flex)`
  height: 100%;
  justify-content: space-between;
  width: 100%;
  @media (min-width: ${breakpoints.md}) {
    width: initial;
    justify-content: flex-start;
  }
`

export const DesktopContainer = styled(Flex)`
  overflow-x: auto;
  display: none;
  @media (min-width: ${breakpoints.md}) {
    display: flex;
  }
`

export const PriceContainer = styled(MarketContainer)`
  margin-right: 14px;
  @media (min-width: ${breakpoints.md}) {
    margin-right: 32px;
  }
`

export const MobileMarketContainer = styled(MarketContainer)`
  overflow-x: auto;
  display: flex;
  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
`

export const DividerStyled = styled(Divider)`
  margin-right: 14px;
  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
`

export const PriceText = styled(Text)`
  font-size: 15px;
  @media (min-width: ${breakpoints.xs}) {
    font-size: 18px;
  }
  @media (min-width: ${breakpoints.md}) {
    font-size: 20px;
  }
`
