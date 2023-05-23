import { Container, Flex, Spinner, Text } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

import { useMarketContext } from '@/contexts/marketContext'

import colors from '@ds/theme/colors'

import { Big18Math, formatBig18Percent, formatBig18USDPrice } from '@utils/big18Utils'
import { Hour } from '@utils/timeUtils'

import {
  DesktopContainer,
  DividerStyled,
  MarketContainer,
  MobileMarketContainer,
  PriceContainer,
  ResponsiveFlex,
  Stat,
} from './components'
import { useMarketBarCopy } from './hooks'

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
  const { selectedMarketSnapshot: snapshot, selectedMarketDailyData: dailyData } = useMarketContext()

  const totalVolume = useMemo(() => {
    if (!dailyData?.volume) return 0n
    return dailyData.volume.reduce((acc, cur) => acc + BigInt(cur.takerNotional), 0n)
  }, [dailyData?.volume])

  const longRate = (snapshot?.long?.rate ?? 0n) * Hour
  const shortRate = (snapshot?.short?.rate ?? 0n) * Hour
  const currentPrice = Big18Math.abs(snapshot?.long?.latestVersion?.price ?? snapshot?.short?.latestVersion.price ?? 0n)
  const change = currentPrice - BigInt(dailyData?.start?.at(0)?.toVersionPrice ?? currentPrice)

  const formattedValues = {
    price: formatBig18USDPrice(currentPrice),
    change: formatBig18Percent(Big18Math.div(change, BigInt(dailyData?.start?.at(0)?.toVersionPrice || 1))),
    hourlyFunding: `${formatBig18Percent(longRate, { numDecimals: 4 })} / ${formatBig18Percent(shortRate, {
      numDecimals: 4,
    })}`,
    low: formatBig18USDPrice(BigInt(dailyData?.low?.at(0)?.toVersionPrice || 0)),
    high: formatBig18USDPrice(BigInt(dailyData?.high?.at(0)?.toVersionPrice || 0)),
    volume: formatBig18USDPrice(totalVolume, { compact: true }),
    openInterest: `${formatBig18USDPrice(snapshot?.long?.openInterest.taker, {
      compact: true,
    })} / ${formatBig18USDPrice(snapshot?.short?.openInterest.taker, { compact: true })}`,
    liquidity: `${formatBig18USDPrice(snapshot?.long?.openInterest.maker, {
      compact: true,
    })} / ${formatBig18USDPrice(snapshot?.short?.openInterest.maker, { compact: true })}`,
  }

  return (
    <Container display="flex" flexDirection="row" alignItems="center" height="100%">
      <ResponsiveFlex>
        <MarketContainer mr={6} ml={0}>
          <MarketSelector />
        </MarketContainer>
        <Flex>
          <PriceContainer>
            <Text fontSize="20px">{formattedValues.price}</Text>
          </PriceContainer>
          <DividerStyled orientation="vertical" />
          <MobileMarketContainer mr={0} maxWidth="90px" overflowX="auto" overflowY="hidden">
            <Stat label={copy.change} value={formattedValues.change} valueColor={colors.brand.green} />
          </MobileMarketContainer>
        </Flex>
      </ResponsiveFlex>
      <DesktopContainer>
        <MarketContainer>
          <Stat label={copy.change} value={formattedValues.change} valueColor={colors.brand.green} />
        </MarketContainer>
        <MarketContainer>
          <Stat label={copy.hourlyFunding} value={formattedValues.hourlyFunding} />
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
          <Stat label={copy.openInterest} value={formattedValues.openInterest} />
        </MarketContainer>
        <MarketContainer>
          <Stat label={copy.liquidity} value={formattedValues.liquidity} />
        </MarketContainer>
      </DesktopContainer>
    </Container>
  )
}
