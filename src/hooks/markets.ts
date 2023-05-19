import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { SupportedAsset } from "@/constants/assets";

import { useLens } from "./contracts";
import { ChainMarkets } from "@/constants/markets";
import { useChainId, useGraphClient } from "./network";
import { last24hrBounds } from "@/utils/time";
import { gql } from "@t/gql";

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
  const market = !!asset && ChainMarkets[chainId][asset];

  return useQuery({
    queryKey: ["userAssetSnapshot", chainId, user, asset],
    enabled: !!user && !!asset && !!market,
    queryFn: async () => {
      if (!user || !market) return;
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

export const useAsset24hrData = (asset: SupportedAsset) => {
  const chainId = useChainId();
  const graphClient = useGraphClient();

  return useQuery({
    queryKey: ["asset24Data", chainId, asset],
    queryFn: async () => {
      const market = ChainMarkets[chainId][asset];
      if (!market) return;

      const { from, to } = last24hrBounds();

      const query = gql(`
        query get24hrData($products: [Bytes!]!, $long: Bytes!, $from: BigInt!, $to: BigInt!) {
          volume: bucketedVolumes(
            where:{bucket: hourly, product_in: $products, periodStartTimestamp_gte: $from, periodStartTimestamp_lte: $to}
            orderBy: periodStartTimestamp
            orderDirection: asc
          ) {
            periodStartTimestamp
            takerNotional
          }
          low: settles(
            where: { product: $long, blockTimestamp_gte: $from, blockTimestamp_lte: $to }
            orderBy: toVersionPrice
            orderDirection: asc
          ) {
            toVersionPrice
          }
          high: settles(
            where: { product: $long, blockTimestamp_gte: $from, blockTimestamp_lte: $to }
            orderBy: toVersionPrice
            orderDirection: desc
          ) {
            toVersionPrice
          }
          start: settles(
            where: { product: $long, blockTimestamp_gte: $from, blockTimestamp_lte: $to }
            orderBy: blockTimestamp
            orderDirection: asc
          ) {
            toVersionPrice
          }
        }
      `);

      const result = await graphClient.request(query, {
        products: [market.long, market.short],
        long: market.long,
        from: from.toString(),
        to: to.toString(),
      });

      return result;
    },
  });
};
