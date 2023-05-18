import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  Text,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import { Button } from "@ds/Button";
import { useMarketContext } from "@/contexts/marketContext";
import { PairLabel, HamburgerIcon, AssetButton } from "./components";
import { useSelectorCopy } from "../hooks";
import { ASSET_METADATA, L2SupportedAsset } from "@/constants/currencies";

function MarketSelector() {
  const { selectedMarket, setSelectedMarket } = useMarketContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const copy = useSelectorCopy();

  return (
    <Popover
      placement="bottom-start"
      variant="assetSelector"
      offset={[-8, 6]}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isLazy
    >
      <PopoverTrigger>
        <Button
          label={<PairLabel market={ASSET_METADATA[selectedMarket]} />}
          variant="pairSelector"
          rightIcon={<HamburgerIcon />}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <Flex flex={1} alignItems="center" justifyContent="space-between" mb="14px">
            <Text fontSize="17px">{copy.switchMarket}</Text>
            <PopoverCloseButton />
          </Flex>
          <Flex flex={1} justifyContent="space-between">
            <Text variant="label">{copy.market}</Text>
            <Text variant="label">{copy.priceLiquidity}</Text>
          </Flex>
        </PopoverHeader>
        <PopoverBody>
          {Object.keys(ASSET_METADATA).map((market) => (
            <AssetButton
              key={market}
              assetMetaData={ASSET_METADATA[market as L2SupportedAsset]}
              price="0.0000"
              liquidity="0.0000"
              isSelected={market === selectedMarket}
              onClick={() => {
                setSelectedMarket(market as any);
                onClose();
              }}
            />
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default MarketSelector;
