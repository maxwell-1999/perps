import colors from "@/components/design-system/theme/colors";
import { Flex, FlexProps, Text } from "@chakra-ui/react";
import styled from "@emotion/styled";
import Hamburger from "@public/icons/burger.svg";
import ethLogo from "@public/icons/eth.png";
import Image from "next/image";

export const HamburgerIcon = styled(Hamburger)`
  color: ${colors.brand.whiteAlpha[50]};
  height: 18px;
`;

export const PairLabel: React.FC<{ pair: string }> = ({ pair }) => (
  <Flex alignItems="center">
    <Image src={ethLogo} height={25} width={25} alt="ethereum" />
    <Text ml={2} fontSize="16px">
      {pair}
    </Text>
  </Flex>
);

export const MarketContainer: React.FC<FlexProps> = ({ children, ...props }) => (
  <Flex height="100%" alignItems="center" mr={8} {...props}>
    {children}
  </Flex>
);

export const Stat: React.FC<{ label: string; value: string; valueColor?: string }> = ({
  label,
  value,
  valueColor,
}) => (
  <Flex flexDirection="column">
    <Text whiteSpace="nowrap" fontSize="12px" color={colors.brand.whiteAlpha[50]}>
      {label}
    </Text>
    <Text color={valueColor}>{value}</Text>
  </Flex>
);

export const ResponsiveFlex = styled(Flex)`
  height: 100%;
  justify-content: space-between;
  width: 100%;
  @media (min-width: 48em) {
    width: initial;
    justify-content: flex-start;
  }
`;

export const DesktopContainer = styled(Flex)`
  overflow-x: scroll;
  display: none;
  &::-webkit-scrollbar {
    width: 2px;
    height: 2px;
  }
  &::-webkit-scrollbar-track {
    width: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${colors.brand.whiteAlpha[20]};
    border-radius: 10px;
  }
  @media (min-width: 48em) {
    display: flex;
  }
`;

export const PriceContainer = styled(MarketContainer)`
  margin-right: 0;
  @media (min-width: 48em) {
    margin-right: 32px;
  }
`;
