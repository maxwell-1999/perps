import { useQuery } from "@tanstack/react-query";
import { getAddress } from "viem";
import { SupportedAsset } from "@/constants/assets";

import { useLens } from "./contracts";
import { ChainMarkets } from "@/constants/markets";
import { useChainId, useGraphClient } from "./network";
import { last24hrBounds } from "@/utils/timeUtils";
import { gql } from "@t/gql";
import { notEmpty } from "@/utils/arrayUtils";
import { IPerennialLens } from "@t/generated/LensAbi";

export const useChainAssetsSnapshots = () => {
  const chainId = useChainId();
  const lens = useLens();

  return useQuery({
    queryKey: ["assetSnapshots", chainId],
    queryFn: async () => {
      const assets = Object.keys(ChainMarkets[chainId]) as SupportedAsset[];
      const markets = assets
        .map((asset) => ChainMarkets[chainId][asset])
        .filter(notEmpty)
        .map((market) => [market.long, market.short].filter(notEmpty))
        .flat();

      const snapshots = await lens["snapshots(address[])"].staticCall(markets);

      return assets.reduce((acc, asset) => {
        acc[asset] = {
          long: snapshots.find(
            (s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.long,
          ),
          short: snapshots.find(
            (s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.short,
          ),
        };

        return acc;
      }, {} as { [key in SupportedAsset]?: { long?: IPerennialLens.ProductSnapshotStructOutput; short?: IPerennialLens.ProductSnapshotStructOutput } });
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
        products: [market.long, market.short].filter(notEmpty),
        long: market.long ?? market.short,
        from: from.toString(),
        to: to.toString(),
      });

      return result;
    },
  });
};
