import colors from "@/components/design-system/theme/colors";
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import styled from "@emotion/styled";
import Hamburger from "@public/icons/burger.svg";
import Image from "next/image";
import { AssetMetadata, L2SupportedAsset } from "@/constants/currencies";
import { Button } from "@ds/Button";

// @ts-ignore
export const HamburgerIcon = styled(Hamburger)`
  color: ${colors.brand.whiteAlpha[50]};
  height: 18px;
`;

export const PairLabel: React.FC<{ market: AssetMetadata[L2SupportedAsset] }> = ({ market }) => (
  <Flex alignItems="center">
    <Image src={market.icon} height={25} width={25} alt={market.name} />
    <Text ml={2} fontSize="16px">
      {market.symbol}
    </Text>
  </Flex>
);

const AssetButtonLabel = ({
  name,
  symbol,
  price,
  liquidity,
  icon,
}: AssetMetadata[L2SupportedAsset] & { price: string; liquidity: string }) => (
  <Flex flex={1} justifyContent="space-between" alignItems="center">
    <Flex alignItems="center">
      <Image src={icon} height={25} width={25} alt={name} />
      <Flex ml={2} flexDirection="column" alignItems="flex-start">
        <Text fontSize="16px" mb={1}>
          {name}
        </Text>
        <Text variant="label">{symbol}</Text>
      </Flex>
    </Flex>
    <Flex ml={2} flexDirection="column" alignItems="flex-end">
      <Text fontSize="16px" mb={1}>
        {price}
      </Text>
      <Text variant="label">{liquidity}</Text>
    </Flex>
  </Flex>
);

interface AssetButtonProps {
  isSelected: boolean;
  onClick: () => void;
  liquidity: string;
  price: string;
  assetMetaData: AssetMetadata[L2SupportedAsset];
}

export const AssetButton = (props: AssetButtonProps) => {
  const hoverColor = useColorModeValue(colors.brand.gray[250], colors.brand.gray[250]);
  const { assetMetaData, price, liquidity, isSelected, onClick } = props;

  return (
    <Button
      variant="pairDropdown"
      onClick={onClick}
      bg={isSelected ? "#0E0E0E" : undefined}
      _hover={isSelected ? {} : { bg: hoverColor }}
      label={<AssetButtonLabel {...assetMetaData} price={price} liquidity={liquidity} />}
    />
  );
};
