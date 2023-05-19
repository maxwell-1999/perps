import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { SupportedAsset } from "@/constants/assets";

import { useLens } from "./contracts";
import { ChainMarkets } from "@/constants/markets";
import { useChainId } from "./network";

export const useAssetSnapshot = (asset: SupportedAsset) => {
  const chainId = useChainId();
  const lens = useLens();

  return useQuery({
    queryKey: ["assetSnapshot", chainId, asset],
    queryFn: async () => {
      const market = ChainMarkets[chainId][asset];
      if (!market) return;

      const snapshots = await lens["snapshots(address[])"].staticCall([market.long, market.short]);

      return {
        long: snapshots[0],
        short: snapshots[1],
      };
    },
  });
};

export const useUserAssetSnapshot = (user?: Address, asset?: SupportedAsset) => {
  const chainId = useChainId();
  const lens = useLens();

  return useQuery({
    queryKey: ["userAssetSnapshot", chainId, user, asset],
    queryFn: async () => {
      if (!user || !asset) return;

      const market = ChainMarkets[chainId][asset];
      if (!market) return;

      const [longSnapshot, shortSnapshot] = await Promise.all([
        lens["snapshot(address,address)"].staticCall(user, market.long),
        lens["snapshot(address,address)"].staticCall(user, market.short),
      ]);

      return {
        long: longSnapshot,
        short: shortSnapshot,
      };
    },
  });
};
