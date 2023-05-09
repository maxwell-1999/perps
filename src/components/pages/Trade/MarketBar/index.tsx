import { Container, Text } from "@chakra-ui/react";
import { Button } from "@ds/Button";
import colors from "@ds/theme/colors";
import {
  MarketContainer,
  PairLabel,
  HamburgerIcon,
  Stat,
  ResponsiveFlex,
  DesktopContainer,
  PriceContainer,
} from "./components";

export default function MarketBar() {
  const dummyProps = {
    pair: "ETH-USD",
    price: "$2,000.00",
    change: "4.00%",
    hourlyFunding: "0.003%",
    low: "$1,400.12",
    high: "$2,100.22",
    volume: "$1,400,123",
    openInterest: "$885,412",
  };
  return (
    <Container display="flex" flexDirection="row" alignItems="center" height="100%">
      <ResponsiveFlex>
        <MarketContainer mr={6}>
          <Button
            variant="pairSelector"
            label={<PairLabel pair={dummyProps.pair} />}
            rightIcon={<HamburgerIcon />}
          />
        </MarketContainer>
        <PriceContainer>
          <Text fontSize="20px">{dummyProps.price}</Text>
        </PriceContainer>
      </ResponsiveFlex>
      <DesktopContainer>
        <MarketContainer>
          <Stat label="Change" value={dummyProps.change} valueColor={colors.brand.green} />
        </MarketContainer>
        <MarketContainer>
          <Stat label="Hourly funding" value={dummyProps.hourlyFunding} />
        </MarketContainer>
        <MarketContainer>
          <Stat label="24h low" value={dummyProps.low} />
        </MarketContainer>
        <MarketContainer>
          <Stat label="24h high" value={dummyProps.high} />
        </MarketContainer>
        <MarketContainer>
          <Stat label="Volume" value={dummyProps.volume} />
        </MarketContainer>
        <MarketContainer>
          <Stat label="Open interest" value={dummyProps.openInterest} />
        </MarketContainer>
      </DesktopContainer>
    </Container>
  );
}
