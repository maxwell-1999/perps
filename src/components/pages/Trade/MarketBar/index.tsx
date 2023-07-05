import { Container, Flex, Spinner } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

import colors from '@ds/theme/colors'

import {
  DesktopContainer,
  DividerStyled,
  MarketContainer,
  MobileMarketContainer,
  PriceContainer,
  PriceText,
  ResponsiveFlex,
  Stat,
} from './components'
import { useFormattedMarketBarValues, useMarketBarCopy } from './hooks'

const MarketSelector = dynamic(() => import('./MarketSelector'), {
  ssr: false,
  loading: () => (
    <Flex height="40px" width="179px" justifyContent="center" alignItems="center">
      <Spinner />
    </Flex>
  ),
})

export default function MarketBar() {
  const copy = useMarketBarCopy()
  const formattedValues = useFormattedMarketBarValues()

  return (
    <Container display="flex" flexDirection="row" alignItems="center" height="100%">
      <ResponsiveFlex>
        <MarketContainer mr={6} ml={0}>
          <MarketSelector />
        </MarketContainer>
        <Flex>
          <PriceContainer>
            <PriceText>{formattedValues.price}</PriceText>
          </PriceContainer>
          <DividerStyled orientation="vertical" />
          <MobileMarketContainer mr={0} maxWidth="90px" overflowX="auto" overflowY="hidden">
            <Stat
              label={copy.dailyChange}
              value={formattedValues.change}
              valueColor={formattedValues.changeIsNegative ? colors.brand.red : colors.brand.green}
            />
          </MobileMarketContainer>
        </Flex>
      </ResponsiveFlex>
      <DesktopContainer>
        <MarketContainer>
          <Stat
            label={copy.dailyChange}
            value={formattedValues.change}
            valueColor={formattedValues.changeIsNegative ? colors.brand.red : colors.brand.green}
          />
        </MarketContainer>
        <MarketContainer>
          <Stat label={copy.low} value={formattedValues.low} />
        </MarketContainer>
        <MarketContainer>
          <Stat label={copy.high} value={formattedValues.high} />
        </MarketContainer>
        <MarketContainer>
          <Stat label={copy.volume} value={formattedValues.volume} />
        </MarketContainer>
        <MarketContainer>
          <Stat label={copy.hourlyFunding} value={formattedValues.hourlyFunding} />
        </MarketContainer>
        <MarketContainer>
          <Stat label={copy.openInterest} value={formattedValues.openInterest} />
        </MarketContainer>
        <MarketContainer>
          <Stat label={copy.liquidity} value={formattedValues.liquidity} />
        </MarketContainer>
      </DesktopContainer>
    </Container>
  )
}
