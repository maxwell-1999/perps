import { Flex, Container, Text, Spinner } from "@chakra-ui/react";
import colors from "@ds/theme/colors";
import {
  MarketContainer,
  Stat,
  ResponsiveFlex,
  DesktopContainer,
  PriceContainer,
  DividerStyled,
} from "./components";
import dynamic from "next/dynamic";
import { useMarketBarCopy } from "./hooks";
import { Big18Math, formatBig18Percent, formatBig18USDPrice } from "@/utils/big18Utils";
import { useMarketContext } from "@/contexts/marketContext";
import { useMemo } from "react";
import { Hour } from "@/utils/time";

const MarketSelector = dynamic(() => import("./MarketSelector"), {
  ssr: false,
  loading: () => (
    <Flex height="40px" width="179px" justifyContent="center" alignItems="center">
      <Spinner />
    </Flex>
  ),
});

export default function MarketBar() {
  const copy = useMarketBarCopy();
  const { snapshot, dailyData } = useMarketContext();

  const totalVolume = useMemo(() => {
    if (!dailyData?.volume) return 0n;
    return dailyData.volume.reduce((acc, cur) => acc + BigInt(cur.takerNotional), 0n);
  }, [dailyData?.volume]);

  const longRate = (snapshot?.long?.rate ?? 0n) * Hour;
  const shortRate = (snapshot?.short?.rate ?? 0n) * Hour;
  const change =
    (snapshot?.long?.latestVersion.price ?? 0n) -
    BigInt(dailyData?.start?.at(0)?.toVersionPrice ?? 0);

  const formattedValues = {
    price: formatBig18USDPrice(snapshot?.long.latestVersion.price),
    change: formatBig18Percent(
      Big18Math.div(change, BigInt(dailyData?.start?.at(0)?.toVersionPrice || 1)),
    ),
    hourlyFunding: `${formatBig18Percent(longRate, { numDecimals: 4 })} / ${formatBig18Percent(
      shortRate,
      { numDecimals: 4 },
    )}`,
    low: formatBig18USDPrice(BigInt(dailyData?.low?.at(0)?.toVersionPrice || 0)),
    high: formatBig18USDPrice(BigInt(dailyData?.high?.at(0)?.toVersionPrice || 0)),
    volume: formatBig18USDPrice(totalVolume),
    openInterest: `${formatBig18USDPrice(
      snapshot?.long.openInterest.taker,
    )} / ${formatBig18USDPrice(snapshot?.short.openInterest.taker)}`,
  };

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
          <MarketContainer mobileOnly mr={0}>
            <Stat
              label={copy.change}
              value={formattedValues.change}
              valueColor={colors.brand.green}
            />
          </MarketContainer>
        </Flex>
      </ResponsiveFlex>
      <DesktopContainer>
        <MarketContainer>
          <Stat
            label={copy.change}
            value={formattedValues.change}
            valueColor={colors.brand.green}
          />
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
      </DesktopContainer>
    </Container>
  );
}
