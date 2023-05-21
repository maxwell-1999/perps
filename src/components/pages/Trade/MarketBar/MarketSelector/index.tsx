import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  Text,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import { Button, IconButton } from "@ds/Button";
import { useMarketContext } from "@/contexts/marketContext";
import { PairLabel, HamburgerIcon, AssetButton } from "./components";
import { useSelectorCopy } from "../hooks";
import { AssetMetadata, SupportedAsset } from "@/constants/assets";
import { ChainMarkets } from "@/constants/markets";
import CloseX from "@public/icons/close-x.svg";
import { Big18Math, formatBig18USDPrice } from "@/utils/big18Utils";

function MarketSelector() {
  const { chainId, selectedMarket, setSelectedMarket, snapshots } = useMarketContext();
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
          label={<PairLabel market={AssetMetadata[selectedMarket]} />}
          variant="pairSelector"
          rightIcon={<HamburgerIcon />}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <Flex flex={1} alignItems="center" justifyContent="space-between" mb="14px">
            <Text fontSize="17px">{copy.switchMarket}</Text>
            <IconButton
              variant="text"
              icon={<CloseX />}
              aria-label={copy.close}
              onClick={onClose}
            />
          </Flex>
          <Flex flex={1} justifyContent="space-between">
            <Text variant="label">{copy.market}</Text>
            <Text variant="label">{copy.priceLiquidity}</Text>
          </Flex>
        </PopoverHeader>
        <PopoverBody>
          {Object.keys(ChainMarkets[chainId]).map((market) => (
            <AssetButton
              key={market}
              assetMetaData={AssetMetadata[market as SupportedAsset]}
              price={formatBig18USDPrice(
                Big18Math.abs(
                  snapshots?.[market as SupportedAsset]?.long?.latestVersion.price ??
                    snapshots?.[market as SupportedAsset]?.short?.latestVersion.price ??
                    0n,
                ),
              )}
              liquidity={`${formatBig18USDPrice(
                snapshots?.[market as SupportedAsset]?.long?.openInterest.maker ?? 0n,
                { compact: true },
              )} / ${formatBig18USDPrice(
                snapshots?.[market as SupportedAsset]?.short?.openInterest.maker ?? 0n,
                { compact: true },
              )}`}
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
