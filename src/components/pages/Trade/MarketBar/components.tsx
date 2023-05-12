import colors from "@/components/design-system/theme/colors";
import { Flex, FlexProps, Text, Divider } from "@chakra-ui/react";
import styled from "@emotion/styled";
import Hamburger from "@public/icons/burger.svg";
import ethLogo from "@public/icons/eth.png";
import Image from "next/image";
import { breakpoints } from "@ds/theme/styles";

// @ts-ignore
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

export const BaseMarketContainer: React.FC<FlexProps> = ({ children, ...props }) => (
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
  @media (min-width: ${breakpoints.sm}) {
    width: initial;
    justify-content: flex-start;
  }
`;

export const DesktopContainer = styled(Flex)`
  overflow-x: auto;
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
  @media (min-width: ${breakpoints.sm}) {
    display: flex;
  }
`;

export const PriceContainer = styled(BaseMarketContainer)`
  margin-right: 14px;
  @media (min-width: ${breakpoints.sm}) {
    margin-right: 32px;
  }
`;

export const MarketContainer = styled(BaseMarketContainer)<{ mobileOnly?: boolean }>`
  @media (min-width: ${breakpoints.sm}) {
    display: ${({ mobileOnly }) => (mobileOnly ? "none" : "flex")};
  }
`;

export const DividerStyled = styled(Divider)`
  margin-right: 14px;
  @media (min-width: ${breakpoints.sm}) {
    display: none;
  }
`;
