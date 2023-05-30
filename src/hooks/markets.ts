import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { multicall } from '@wagmi/core'
import { ethers } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { useCallback, useEffect, useState } from 'react'
import { Address, getAddress, numberToHex, parseAbi, toHex, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { ChainMarkets, OrderDirection, addressToAsset } from '@/constants/markets'
import { SupportedChainId } from '@/constants/network'
import { notEmpty, sum, unique } from '@/utils/arrayUtils'
import { Big18Math } from '@/utils/big18Utils'
import { GraphDefaultPageSize, queryAll } from '@/utils/graphUtils'
import { calcLiquidationPrice, next, side as positionSide, size } from '@/utils/positionUtils'
import { last24hrBounds } from '@/utils/timeUtils'

import { ICollateralAbi, IProductAbi__factory } from '@t/generated'
import { IPerennialLens, LensAbi } from '@t/generated/LensAbi'
import { gql } from '@t/gql'
import { GetAccountPositionsQuery } from '@t/gql/graphql'

import { useCollateral, useLens } from './contracts'
import { useChainId, useGraphClient, useWsProvider } from './network'
import { usePyth } from './network'

export type AssetSnapshots = {
  [key in SupportedAsset]?: {
    [OrderDirection.Long]?: IPerennialLens.ProductSnapshotStructOutput
    [OrderDirection.Short]?: IPerennialLens.ProductSnapshotStructOutput
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
        .map((market) => [market.Long, market.Short].filter(notEmpty))
        .flat()

      const snapshots = await lens['snapshots(address[])'].staticCall(markets)

      return assets.reduce((acc, asset) => {
        acc[asset] = {
          [OrderDirection.Long]: snapshots.find(
            (s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.Long,
          ),
          [OrderDirection.Short]: snapshots.find(
            (s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.Short,
          ),
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
        products: [market.Long, market.Short].filter(notEmpty),
        long: market.Long ?? market.Short ?? zeroAddress,
        from: from.toString(),
        to: to.toString(),
      })
    },
  })
}

export type PositionDetails = Awaited<ReturnType<typeof fetchUserPositionDetails>>

export type UserCurrentPositions = {
  [key in SupportedAsset]?: {
    [OrderDirection.Long]?: PositionDetails
    [OrderDirection.Short]?: PositionDetails
  }
}
export const useUserCurrentPositions = () => {
  const chainId = useChainId()
  const { address } = useAccount()
  const lens = useLens()
  const collateral = useCollateral()
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
        .map((market) => [market.Long, market.Short].filter(notEmpty))
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
            [OrderDirection.Long]: await fetchUserPositionDetails(
              chainId,
              asset,
              OrderDirection.Long,
              address,
              lens,
              collateral,
              graphClient,
              accountSnapshots.find((s) => getAddress(s.productAddress) === market.Long),
              positions.positions.find((p) => getAddress(p.product) === market.Long),
              productSnapshots[asset]?.Long,
            ),
            [OrderDirection.Short]: await fetchUserPositionDetails(
              chainId,
              asset,
              OrderDirection.Short,
              address,
              lens,
              collateral,
              graphClient,
              accountSnapshots.find((s) => getAddress(s.productAddress) === market.Short),
              positions.positions.find((p) => getAddress(p.product) === market.Short),
              productSnapshots[asset]?.Short,
            ),
          }
        }),
      )

      return positionDetails.filter(notEmpty).reduce((acc, { asset, Long, Short }) => {
        acc[asset] = { Long, Short }
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
  const collateral = useCollateral()

  return useInfiniteQuery({
    queryKey: ['userChainPositionHistory', chainId, address],
    enabled: !!address,
    queryFn: async ({ pageParam }) => {
      if (!address) return
      const assets = Object.keys(ChainMarkets[chainId]) as SupportedAsset[]
      const markets = assets
        .map((asset) => ChainMarkets[chainId][asset])
        .filter(notEmpty)
        .map((market) => [market.Long, market.Short].filter(notEmpty))
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
          chainId,
          asset.asset,
          asset.direction,
          address,
          lens,
          collateral,
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
  chainId: SupportedChainId,
  asset: SupportedAsset,
  direction: OrderDirection,
  address: Address,
  lens: LensAbi,
  collateralContract: ICollateralAbi,
  graphClient: GraphQLClient,
  snapshot?: IPerennialLens.UserProductSnapshotStructOutput,
  graphPosition?: GetAccountPositionsQuery['positions'][0],
  productSnapshot?: IPerennialLens.ProductSnapshotStructOutput,
) => {
  if (!snapshot || !productSnapshot) return { asset, direction, currentCollateral: 0n }
  const { productAddress, collateral, pre, position, openInterest } = snapshot
  const nextNotional = Big18Math.abs(Big18Math.mul(size(next(pre, position)), productSnapshot.latestVersion.price))
  const side = positionSide(next(pre, position))

  // If no graph position, return snapshot values
  if (!graphPosition) {
    return {
      asset,
      direction,
      position: snapshot.position[side],
      nextPosition: next(pre, position)[side],
      startCollateral: collateral,
      currentCollateral: collateral,
      averageEntry: productSnapshot.latestVersion.price,
      liquidationPrice: calcLiquidationPrice(productSnapshot, next(pre, position), collateral),
      notional: size(openInterest),
      nextNotional,
      leverage: collateral > 0n ? Big18Math.div(size(openInterest), collateral) : 0n,
      nextLeverage: collateral > 0n ? Big18Math.div(nextNotional, collateral) : 0n,
    }
  }
  const { startBlock, depositAmount, fees, endBlock, lastUpdatedBlockNumber } = graphPosition

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
      meta: _meta {
        block {
          number
        }
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

  const productContract = IProductAbi__factory.connect(productAddress, lens.runner)
  const currentVersion = productSnapshot.latestVersion
  const latestVersion = await productContract['latestVersion()']()
  // Get the post-settlement value
  const [, latestValue, latestPrice, currentValue] = await multicall({
    chainId,
    allowFailure: false,
    contracts: [
      {
        abi: parseAbi(['function settle() external']),
        address: getAddress(productAddress),
        functionName: 'settle',
      },
      {
        abi: parseAbi(['function valueAtVersion(uint256) external view returns ((int256 maker, int256 taker))']),
        address: getAddress(productAddress),
        functionName: 'valueAtVersion',
        args: [latestVersion + 1n],
      },
      {
        abi: parseAbi([
          'function atVersion(uint256) external view returns ((uint256 version, uint256 timestamp, int256 price))',
        ]),
        address: getAddress(productAddress),
        functionName: 'atVersion',
        args: [latestVersion + 1n],
      },
      {
        abi: parseAbi(['function valueAtVersion(uint256) external view returns ((int256 maker, int256 taker))']),
        address: getAddress(productAddress),
        functionName: 'valueAtVersion',
        args: [currentVersion.version],
      },
    ],
  })

  const atVersions = (
    await graphClient.request(valueAtVersionQuery, {
      product: productAddress,
      versions: settleVersions.map((v) => v.toString()),
    })
  ).settles.reduce(
    (acc, settle) => {
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
    },
    new Map<bigint, { price: bigint; makerValue: bigint; takerValue: bigint }>([
      [
        latestVersion + 1n, // Place version + 1 in map, since this data isn't available in the graph yet
        {
          price: latestPrice.price,
          makerValue: latestValue.maker ?? 0n,
          takerValue: latestValue.taker ?? 0n,
        },
      ],
      [
        currentVersion.version, // Place current version in map, since this data isn't available in the graph yet
        {
          price: currentVersion.price,
          makerValue: currentValue.maker ?? 0n,
          takerValue: currentValue.taker ?? 0n,
        },
      ],
    ]),
  )

  // Create a separate sub position for each position change to calculate the average entry price
  let currentPosition = 0n
  let totalNotional = 0n
  let totalSize = 0n
  const subPositions = changesMerged.map((change, i) => {
    const { version, amount } = change
    let settleVersion = BigInt(version) + 1n
    // If the settle version is ahead of currentVersion, set the settle version to the current version
    if (settleVersion > currentVersion.version) settleVersion = currentVersion.version
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

    currentPosition += subPosition.delta
    totalNotional += Big18Math.mul(currentPosition, subPosition.settlePrice)
    totalSize += currentPosition
    return subPosition
  })

  if (currentPosition !== 0n) {
    // If the position is still open, add a sub position for the last version to latest version
    const settleValue = side === 'maker' ? currentValue.maker : currentValue.taker
    const prevVersion = subPositions.at(-1)?.settleVersion ?? 0n
    const prevValue = subPositions.at(-1)?.settleValue ?? 0n
    const prevPrice = subPositions.at(-1)?.settlePrice ?? 0n

    subPositions.push({
      settleVersion: currentVersion.version,
      settleValue,
      settlePrice: Big18Math.abs(currentVersion.price),

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
  const averageEntry = Big18Math.div(totalNotional, totalSize)

  // Collateral at one block before the position was opened
  const startCollateral = await lens['collateral(address,address)'].staticCall(address, productAddress, {
    blockTag: numberToHex(Number(startBlock) - 1),
  })
  const initialDeposits =
    sum(positionChanges.initialDeposits.map((d) => BigInt(d.amount))) -
    sum(positionChanges.initialWithdrawals.map((d) => BigInt(d.amount)))

  let deposits = BigInt(depositAmount)

  // If this is the current position, pull values between graph head and chain head
  if (BigInt(endBlock) === -1n) {
    // Pull any deposits/withdrawals that have happened between graph syncs
    const [_deposits, _withdrawals] = await Promise.all([
      collateralContract.queryFilter(
        collateralContract.filters.Deposit(address, productAddress),
        toHex(BigInt(positionChanges.meta?.block.number || lastUpdatedBlockNumber) + 1n),
      ),
      collateralContract.queryFilter(
        collateralContract.filters.Withdrawal(address, productAddress),
        toHex(BigInt(positionChanges.meta?.block.number || lastUpdatedBlockNumber) + 1n),
      ),
    ])

    deposits = deposits + sum(_deposits.map((d) => d.args.amount)) - sum(_withdrawals.map((d) => d.args.amount))
  }

  return {
    asset,
    direction,
    product: productAddress,
    side,
    position: position[side],
    nextPosition: next(pre, position)[side],
    startCollateral: startCollateral + initialDeposits,
    currentCollateral: collateral,
    deposits,
    averageEntry,
    liquidationPrice: calcLiquidationPrice(productSnapshot, next(pre, position), collateral),
    notional: size(openInterest),
    nextNotional,
    leverage: collateral > 0n ? Big18Math.div(size(openInterest), collateral) : 0n,
    nextLeverage: collateral > 0n ? Big18Math.div(nextNotional, collateral) : 0n,
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

export const useRefreshMarketDataOnPriceUpdates = () => {
  const chainId = useChainId()
  const [aggregators, setAggregators] = useState<string[]>([])
  const { data: products } = useChainAssetSnapshots()
  const wsProvider = useWsProvider()
  const { refetch: refetchAssetSnapshots } = useChainAssetSnapshots()
  const { refetch: refetchUserCurrentPositions } = useUserCurrentPositions()

  const refresh = useCallback(
    () => Promise.all([refetchAssetSnapshots, refetchUserCurrentPositions]),
    [refetchAssetSnapshots, refetchUserCurrentPositions],
  )

  useEffect(() => {
    const fetchAggregatorAddresses = async () => {
      if (!products) return

      // Product -> Perennial ChainlinkFeedOracle
      const pnlOracle = Array.from(
        new Set(
          Object.values(products).flatMap((p) =>
            [p.Long?.productInfo.oracle, p.Short?.productInfo.oracle].filter(notEmpty),
          ),
        ),
      )

      const aggregatorAbi = parseAbi(['function aggregator() view returns (address)'])
      // Feed Oracle -> Proxy
      const proxyAddresses = await multicall({
        chainId,
        allowFailure: false,
        contracts: pnlOracle.map((p) => ({
          address: getAddress(p),
          abi: aggregatorAbi,
          functionName: 'aggregator',
        })),
      })

      // Proxy -> Aggregator
      const aggregatorAddresses = await multicall({
        chainId,
        allowFailure: false,
        contracts: proxyAddresses.map((p) => ({
          address: p,
          abi: aggregatorAbi,
          functionName: 'aggregator',
        })),
      })
      setAggregators(unique(aggregatorAddresses))
    }

    fetchAggregatorAddresses()
  }, [products, chainId])

  useEffect(() => {
    if (!aggregators.length || !wsProvider) return
    // Ideally we could use wagmi for this, but they don't support eth_subscribe
    const contracts = aggregators.map(
      (a) =>
        new ethers.Contract(
          a,
          ['event AnswerUpdated(int256 indexed current,uint256 indexed roundId,uint256 updatedAt)'],
          wsProvider,
        ),
    )
    contracts.forEach((c) => c.on(c.filters.AnswerUpdated(), refresh))
    return () => contracts.forEach((l) => l.removeAllListeners())
  }, [aggregators, refresh, wsProvider])
}
