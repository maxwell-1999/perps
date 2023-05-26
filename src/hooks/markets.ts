import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { GraphQLClient } from 'graphql-request'
import { useEffect, useState } from 'react'
import { Address, getAddress, numberToHex, toHex, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { ChainMarkets, addressToAsset } from '@/constants/markets'
import { notEmpty, sum, unique } from '@/utils/arrayUtils'
import { Big18Math } from '@/utils/big18Utils'
import { GraphDefaultPageSize, queryAll } from '@/utils/graphUtils'
import { calcLiquidationPrice, next, size } from '@/utils/positionUtils'
import { last24hrBounds } from '@/utils/timeUtils'

import { IProductAbi__factory } from '@t/generated'
import { IPerennialLens, LensAbi } from '@t/generated/LensAbi'
import { gql } from '@t/gql'
import { GetAccountPositionsQuery } from '@t/gql/graphql'

import { useLens } from './contracts'
import { useChainId, useGraphClient } from './network'
import { usePyth } from './network'

export type AssetSnapshots = {
  [key in SupportedAsset]?: {
    long?: IPerennialLens.ProductSnapshotStructOutput
    short?: IPerennialLens.ProductSnapshotStructOutput
  }
}
export const useChainAssetSnapshots = () => {
  const chainId = useChainId()
  const lens = useLens()

  return useQuery({
    queryKey: ['assetSnapshots', chainId],
    queryFn: async () => {
      const assets = Object.keys(ChainMarkets[chainId]) as SupportedAsset[]
      const markets = assets
        .map((asset) => ChainMarkets[chainId][asset])
        .filter(notEmpty)
        .map((market) => [market.long, market.short].filter(notEmpty))
        .flat()

      const snapshots = await lens['snapshots(address[])'].staticCall(markets)

      return assets.reduce((acc, asset) => {
        acc[asset] = {
          long: snapshots.find((s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.long),
          short: snapshots.find((s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.short),
        }

        return acc
      }, {} as AssetSnapshots)
    },
  })
}

export const useAsset24hrData = (asset: SupportedAsset) => {
  const chainId = useChainId()
  const graphClient = useGraphClient()
  const market = ChainMarkets[chainId][asset]

  return useQuery({
    queryKey: ['asset24Data', chainId, asset],
    enabled: !!market,
    queryFn: async () => {
      if (!market) return

      const { from, to } = last24hrBounds()

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
          low: productVersions(
            where: { product: $long, timestamp_gte: $from, timestamp_lte: $to }
            orderBy: price
            orderDirection: asc
          ) {
            price
          }
          high: productVersions(
            where: { product: $long, timestamp_gte: $from, timestamp_lte: $to }
            orderBy: price
            orderDirection: desc
          ) {
            price
          }
          start: productVersions(
            where: { product: $long, timestamp_gte: $from, timestamp_lte: $to }
            orderBy: timestamp
            orderDirection: asc
            first: 1
          ) {
            price
          }
        }
      `)

      return graphClient.request(query, {
        products: [market.long, market.short].filter(notEmpty),
        long: market.long ?? market.short ?? zeroAddress,
        from: from.toString(),
        to: to.toString(),
      })
    },
  })
}

export type PositionDetails = Awaited<ReturnType<typeof fetchUserPositionDetails>>

export type UserCurrentPositions = {
  [key in SupportedAsset]?: {
    long?: PositionDetails
    short?: PositionDetails
  }
}
export const useUserCurrentPositions = () => {
  const chainId = useChainId()
  const { address } = useAccount()
  const lens = useLens()
  const graphClient = useGraphClient()
  const { data: productSnapshots } = useChainAssetSnapshots()

  return useQuery({
    queryKey: ['userCurrentPositions', chainId, address],
    enabled: !!address && !!productSnapshots,
    queryFn: async () => {
      if (!address || !productSnapshots) return
      const assets = Object.keys(ChainMarkets[chainId]) as SupportedAsset[]
      const markets = assets
        .map((asset) => ChainMarkets[chainId][asset])
        .filter(notEmpty)
        .map((market) => [market.long, market.short].filter(notEmpty))
        .flat()

      const accountSnapshots = await lens['snapshots(address,address[])'].staticCall(address, markets)

      const query = gql(`
        query getAccountPositions($account: Bytes!, $products: [Bytes!]!) {
          positions: productAccountPositions(where: { account: $account, product_in: $products, endBlock: -1 }) {
            product
            side
            depositAmount
            startBlock
            startVersion
            valuePnl
            preAmount
            amount
            fees
            endBlock
            lastUpdatedBlockNumber
          }
        }
      `)

      const positions = await graphClient.request(query, {
        account: address,
        products: markets,
      })

      const positionDetails = await Promise.all(
        assets.map(async (asset) => {
          const market = ChainMarkets[chainId][asset]
          if (!market) return

          return {
            asset,
            long: await fetchUserPositionDetails(
              asset,
              address,
              lens,
              graphClient,
              accountSnapshots.find((s) => getAddress(s.productAddress) === market.long),
              positions.positions.find((p) => getAddress(p.product) === market.long),
              productSnapshots[asset]?.long,
            ),
            short: await fetchUserPositionDetails(
              asset,
              address,
              lens,
              graphClient,
              accountSnapshots.find((s) => getAddress(s.productAddress) === market.short),
              positions.positions.find((p) => getAddress(p.product) === market.short),
              productSnapshots[asset]?.short,
            ),
          }
        }),
      )

      return positionDetails.filter(notEmpty).reduce((acc, { asset, long, short }) => {
        acc[asset] = { long: long, short: short }
        return acc
      }, {} as UserCurrentPositions)
    },
  })
}

const PositionHistoryPageSize = 3
export const useUserChainPositionHistory = () => {
  const chainId = useChainId()
  const graphClient = useGraphClient()
  const { address } = useAccount()
  const lens = useLens()

  return useInfiniteQuery({
    queryKey: ['userChainPositionHistory', chainId, address],
    enabled: !!address,
    queryFn: async ({ pageParam }) => {
      if (!address) return
      const assets = Object.keys(ChainMarkets[chainId]) as SupportedAsset[]
      const markets = assets
        .map((asset) => ChainMarkets[chainId][asset])
        .filter(notEmpty)
        .map((market) => [market.long, market.short].filter(notEmpty))
        .flat()

      const query = gql(`
        query getPreviousAccountPositions($account: Bytes!, $products: [Bytes!]!, $first: Int!, $skip: Int!) {
          positions: productAccountPositions(
            where: { account: $account, product_in: $products, endBlock_gt: -1 }
            first: $first
            skip: $skip
            orderBy: endBlock
            orderDirection: desc
          ) {
            product
            side
            depositAmount
            startBlock
            startVersion
            valuePnl
            preAmount
            amount
            fees
            endBlock
            lastUpdatedBlockNumber
          }
        }
      `)

      const graphPositions = await graphClient.request(query, {
        account: address,
        products: markets,
        first: PositionHistoryPageSize,
        skip: pageParam || 0,
      })

      const accountSnapshots = graphPositions.positions.map(async (graphPosition) => {
        const snapshot = await lens['snapshot(address,address)'](address, graphPosition.product, {
          blockTag: toHex(BigInt(graphPosition.endBlock)),
        })
        const productSnapshot = await lens['snapshot(address)'](graphPosition.product, {
          blockTag: toHex(BigInt(graphPosition.endBlock)),
        })

        const asset = addressToAsset(getAddress(graphPosition.product))

        if (!asset) return
        const positionDetails = await fetchUserPositionDetails(
          asset,
          address,
          lens,
          graphClient,
          snapshot,
          graphPosition,
          productSnapshot,
        )

        return positionDetails
      })

      const positions = await Promise.all(accountSnapshots)
      return {
        positions: positions.filter(notEmpty),
        hasMore: positions.length === PositionHistoryPageSize,
      }
    },
    getNextPageParam: (lastPage, pages) => (lastPage?.hasMore ? pages.length : undefined),
  })
}

// Pulls all data required to calculate metrics across a user's current or historical position
const fetchUserPositionDetails = async (
  asset: SupportedAsset,
  address: Address,
  lens: LensAbi,
  graphClient: GraphQLClient,
  snapshot?: IPerennialLens.UserProductSnapshotStructOutput,
  graphPosition?: GetAccountPositionsQuery['positions'][0],
  productSnapshot?: IPerennialLens.ProductSnapshotStructOutput,
) => {
  if (!snapshot) return { currentCollateral: 0n }
  const { productAddress, collateral, pre, position, openInterest } = snapshot

  if (!graphPosition || !productSnapshot) return { currentCollateral: collateral }
  const { side, startBlock, depositAmount, fees } = graphPosition

  const query = gql(`
    query getPositionChanges(
      $account: Bytes!,
      $product: Bytes!,
      $startBlock: BigInt!,
      $endBlock: BigInt!,
      $taker: Boolean!,
      $first: Int!,
      $skip: Int!
    ) {
      takeOpeneds(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
        blockNumber_lt: $endBlock,
      }, first: $first, skip: $skip, orderBy: blockNumber, orderDirection: asc) {
        version
        amount
        fee
        transactionHash
        blockNumber
        blockTimestamp
      }
      takeCloseds(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
        blockNumber_lt: $endBlock,
      }, first: $first, skip: $skip, orderBy: blockNumber, orderDirection: asc) {
        version
        amount
        fee
        transactionHash
        blockNumber
        blockTimestamp
      }
      makeOpeneds(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
        blockNumber_lt: $endBlock,
      }, first: $first, skip: $skip, orderBy: blockNumber, orderDirection: asc) {
        version
        amount
        fee
        transactionHash
        blockNumber
        blockTimestamp
      }
      makeCloseds(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
        blockNumber_lt: $endBlock,
      }, first: $first, skip: $skip, orderBy: blockNumber, orderDirection: asc) {
        version
        amount
        fee
        transactionHash
        blockNumber
        blockTimestamp
      }
      liquidations(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
        blockNumber_lt: $endBlock,
      }) {
        fee
        transactionHash
        blockNumber
        blockTimestamp
      }
      initialDeposits: deposits(where:{
        account: $account,
        product: $product,
        blockNumber: $startBlock,
      }, first: $first, skip: $skip) {
        amount
      }
      initialWithdrawals: withdrawals(where:{
        account: $account,
        product: $product,
        blockNumber: $startBlock,
      }, first: $first, skip: $skip) {
        amount
      }
    }
  `)

  // Pull all position changes that have occurred since the position was opened
  const positionChanges = await queryAll(async (page: number) => {
    return graphClient.request(query, {
      account: address,
      product: productAddress,
      startBlock,
      endBlock: (BigInt(graphPosition.lastUpdatedBlockNumber) + 1n).toString(),
      taker: side === 'taker',
      first: GraphDefaultPageSize,
      skip: page * GraphDefaultPageSize,
    })
  })

  // Merge opens and closes, sorting by blockNumber
  const changesMerged = (
    side === 'taker'
      ? [
          ...positionChanges.takeOpeneds,
          ...positionChanges.takeCloseds.map((c) => ({ ...c, amount: -BigInt(c.amount) })),
        ]
      : [
          ...positionChanges.makeOpeneds,
          ...positionChanges.makeCloseds.map((c) => ({ ...c, amount: -BigInt(c.amount) })),
        ]
  ).sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber))

  // Settle versions is change.version + 1 unless it is the latest version
  const settleVersions = unique(changesMerged.map((c) => BigInt(c.version))).flatMap((v) => [v, v + 1n])

  // Get all prices at the settle versions
  const valueAtVersionQuery = gql(`
    query getProductVersions($product: Bytes!, $versions: [BigInt!]!) {
      settles(
        where:{and: [{product: $product}, {or: [{toVersion_in: $versions}, {preVersion_in:$versions}]}] }
      ) {
        product
        preVersion
        preTakerValue
        preMakerValue
        preVersionPrice
        toVersion
        toVersionPrice
        toTakerValue
        toMakerValue
      }
    }
  `)

  const atVersions = (
    await graphClient.request(valueAtVersionQuery, {
      product: productAddress,
      versions: settleVersions.map((v) => v.toString()),
    })
  ).settles.reduce((acc, settle) => {
    acc.set(BigInt(settle.preVersion), {
      price: BigInt(settle.preVersionPrice),
      makerValue: BigInt(settle.preMakerValue),
      takerValue: BigInt(settle.preTakerValue),
    })
    acc.set(BigInt(settle.toVersion), {
      price: BigInt(settle.toVersionPrice),
      makerValue: BigInt(settle.toMakerValue),
      takerValue: BigInt(settle.toTakerValue),
    })

    return acc
  }, new Map<bigint, { price: bigint; makerValue: bigint; takerValue: bigint }>())
  // TODO: we should fetch the maker and taker values for the latest version post settlement
  // but the lens does support this, and we don't have a multicall provider yet
  const productContract = IProductAbi__factory.connect(productAddress, lens.runner)
  const latestVersion = productSnapshot.latestVersion
  const settledLatest = await productContract['latestVersion()']()
  const latestValue = await productContract.valueAtVersion(settledLatest)
  atVersions.set(latestVersion.version, {
    price: latestVersion.price,
    makerValue: latestValue.maker,
    takerValue: latestValue.taker,
  })

  // Create a separate sub position for each position change to calculate the average entry price
  // Open 10 ETH @ $1000: PNL 0
  // Close 1 ETH @ 1100: Leg PNL = 10 * (1100 - 1000) = $1000
  // Close 2 ETH @ 900: Leg PNL = 9 * (900 - 1100) = -$1,800
  // Open 3 ETH @ 1000: Leg PNL = $700
  // etc…
  let currentPosition = 0n
  const subPositions = changesMerged.map((change, i) => {
    const { version, amount } = change
    const settleVersion = BigInt(version) === latestVersion.version ? BigInt(version) : BigInt(version) + 1n
    const settleVersionData = atVersions.get(settleVersion)
    const settleValue =
      graphPosition.side === 'maker' ? settleVersionData?.makerValue ?? 0n : settleVersionData?.takerValue ?? 0n

    const prevVersion = i === 0 ? 0n : BigInt(changesMerged[i - 1].version) + 1n
    const prevVersionData = atVersions.get(prevVersion)
    const prevValue =
      graphPosition.side === 'maker' ? prevVersionData?.makerValue ?? 0n : prevVersionData?.takerValue ?? 0n

    const subPosition = {
      settleVersion,
      settleValue,
      settlePrice: Big18Math.abs(settleVersionData?.price ?? 0n),

      prevVersion,
      prevValue,
      prevPrice: Big18Math.abs(prevVersionData?.price ?? 0n),

      size: currentPosition,
      delta: BigInt(amount),
      pnl: Big18Math.mul(currentPosition, settleValue - prevValue),
      fee: BigInt(change.fee),
      blockNumber: BigInt(change.blockNumber),
      blockTimestamp: BigInt(change.blockTimestamp),
      transctionHash: change.transactionHash,
    }

    currentPosition = BigInt(amount) + currentPosition
    return subPosition
  })
  if (currentPosition !== 0n) {
    // If the position is still open, add a sub position for the last version to latest version
    const settleValue = side === 'maker' ? latestValue.maker : latestValue.taker
    const prevVersion = subPositions.at(-1)?.settleVersion ?? 0n
    const prevValue = subPositions.at(-1)?.settleValue ?? 0n
    const prevPrice = subPositions.at(-1)?.settlePrice ?? 0n

    subPositions.push({
      settleVersion: latestVersion.version,
      settleValue,
      settlePrice: Big18Math.abs(latestVersion.price),

      prevVersion,
      prevValue,
      prevPrice,

      size: currentPosition,
      delta: 0n,
      pnl: Big18Math.mul(currentPosition, settleValue - prevValue),
      fee: 0n,
      transctionHash: '',
      blockNumber: 0n,
      blockTimestamp: 0n,
    })
  }

  // Average Entry = Total Notional / Total Size
  const averageEntry = Big18Math.div(
    sum(subPositions.map((p) => Big18Math.mul(p.settlePrice, p.size))),
    sum(subPositions.map((p) => p.size)),
  )

  // Collateral at one block before the position was opened
  const startCollateral = await lens['collateral(address,address)'].staticCall(address, productAddress, {
    blockTag: numberToHex(Number(startBlock) - 1),
  })
  const initialDeposits =
    sum(positionChanges.initialDeposits.map((d) => BigInt(d.amount))) -
    sum(positionChanges.initialWithdrawals.map((d) => BigInt(d.amount)))

  return {
    asset,
    product: productAddress,
    side,
    position: position[side],
    nextPosition: next(pre, position)[side],
    startCollateral: startCollateral + initialDeposits,
    currentCollateral: collateral,
    deposits: BigInt(depositAmount),
    averageEntry,
    liquidationPrice: calcLiquidationPrice(productSnapshot, next(pre, position), collateral),
    notional: size(openInterest),
    nextNotional: Big18Math.abs(Big18Math.mul(size(next(pre, position)), productSnapshot.latestVersion.price)),
    leverage: collateral > 0n ? Big18Math.div(size(openInterest), collateral) : 0n,
    fees,
    subPositions,
    liquidations: positionChanges.liquidations,
    valuePnl: graphPosition.valuePnl,
  }
}

export const useChainLivePrices = () => {
  const chain = useChainId()
  const pyth = usePyth()
  const markets = ChainMarkets[chain]
  const [prices, setPrices] = useState<{ [key in SupportedAsset]?: bigint }>({})

  useEffect(() => {
    const feedToAsset = Object.keys(markets)
      .map((k) => ({ asset: k, feed: AssetMetadata[k as SupportedAsset].pythFeedId }))
      .filter(notEmpty)
      .reduce((acc, { asset, feed }) => {
        if (feed) acc[feed] = asset as SupportedAsset
        return acc
      }, {} as { [key: string]: SupportedAsset })
    const feedIds = Object.keys(feedToAsset)

    pyth.subscribePriceFeedUpdates(feedIds, (priceFeed) => {
      const price = priceFeed.getPriceNoOlderThan(60)?.price
      setPrices((prices) => ({
        ...prices,
        // Pyth price is 8 decimals, normalize to expected 18 decimals by multiplying by 10^10
        [feedToAsset['0x' + priceFeed.id]]: price ? BigInt(price) * 10n ** 10n : undefined,
      }))
    })

    return () => {
      pyth.unsubscribePriceFeedUpdates(feedIds)
    }
  }, [markets, pyth])

  return prices
}

export type LivePrices = Awaited<ReturnType<typeof useChainLivePrices>>
