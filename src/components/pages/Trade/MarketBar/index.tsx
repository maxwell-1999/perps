import { Container, Flex, Spinner, Text } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

import { useMarketContext } from '@/contexts/marketContext'

import { TooltipIcon } from '@ds/Tooltip'
import colors from '@ds/theme/colors'

import {
  DesktopContainer,
  DividerStyled,
  FundingRateStat,
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
  const { isMaker } = useMarketContext()
  const copy = useMarketBarCopy()
  const formattedValues = useFormattedMarketBarValues()

  return (
    <Container
      display="flex"
      flexDirection="row"
      alignItems="center"
      height="100%"
      background={'#1c1c28'}
      className="only-bottom-border"
    >
      <ResponsiveFlex>
        <div className="flex items-center justify-between w-full bg-[#282B39] rounded-[6px]">
          <div className="mr-3">
            <MarketSelector />
          </div>
          <Flex className="!gap-[2px] items-center">
            <PriceContainer className="!m-[0px] w-fit !mr-2">
              <PriceText className="text-[#c3c2d4] text-[14px]">{formattedValues.price}</PriceText>
            </PriceContainer>
            {/* <DividerStyled orientation="vertical" /> */}
            <div className="bg-[#3772FF] px-[6px] py-[2px] rounded-[6px] font-[500] mx-2 text-f13">
              {formattedValues.change}
            </div>
          </Flex>
        </div>
      </ResponsiveFlex>
      <DesktopContainer>
        <MarketContainer>
          <Stat
            label={copy.dailyChange}
            value={formattedValues.change}
            valueColor={formattedValues.changeIsNegative ? colors.brand.red : colors.brand.green}
          />
        </MarketContainer>
        {!isMaker ? (
          <>
            <MarketContainer>
              <Stat label={copy.low} value={formattedValues.low} />
            </MarketContainer>
            <MarketContainer>
              <Stat label={copy.high} value={formattedValues.high} />
            </MarketContainer>
            <MarketContainer>
              <Stat label={copy.volume} value={formattedValues.volume} />
            </MarketContainer>
          </>
        ) : (
          <>
            <MarketContainer>
              <Stat label={copy.volumeLS} value={formattedValues.volumeLS} />
            </MarketContainer>
            <MarketContainer>
              <Stat label={copy.lpExposure} value={`${formattedValues.lpUtilization} ${formattedValues.lpExposure}`} />
            </MarketContainer>
          </>
        )}
        <MarketContainer>
          <FundingRateStat />
        </MarketContainer>
        <MarketContainer>
          <Stat
            label={copy.skew}
            value={
              <Flex gap={1}>
                <Text fontSize="12px" color={colors.brand.green}>
                  {formattedValues.longSkew}
                </Text>
                <Text fontSize="12px"> {copy.slash}</Text>
                <Text fontSize="12px" color={colors.brand.red}>
                  {formattedValues.shortSkew}
                </Text>
              </Flex>
            }
          />
        </MarketContainer>
        <MarketContainer>
          <Stat label={copy.openInterest} value={formattedValues.openInterest} />
        </MarketContainer>
        <MarketContainer>
          <Stat
            label={
              <Flex gap={2} alignItems="center">
                <Text whiteSpace="nowrap" fontSize="12px" color={'#82828F'}>
                  {copy.liquidity}
                </Text>
                <TooltipIcon
                  color={'#82828F'}
                  height="11px"
                  width="11px"
                  tooltipProps={{ placement: 'bottom' }}
                  tooltipText={
                    <Flex flexDirection="column" gap={2}>
                      <Text fontSize="12px" color={'#82828F'}>
                        {copy.totalLiquidity}
                      </Text>
                      <Text fontSize="14px">{formattedValues.totalLiquidity}</Text>
                    </Flex>
                  }
                />
              </Flex>
            }
            value={formattedValues.availableLiquidity}
          />
        </MarketContainer>
      </DesktopContainer>
    </Container>
  )
}
