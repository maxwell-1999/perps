import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { parseAbi } from 'abitype'
import { ethers } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { useCallback, useEffect, useState } from 'react'
import { Address, getAbiItem, getAddress, zeroAddress } from 'viem'
import { PublicClient, useNetwork, usePublicClient, useWalletClient } from 'wagmi'
import { GetContractResult, multicall, waitForTransaction } from 'wagmi/actions'
import { goerli, mainnet } from 'wagmi/chains'

import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { MultiInvokerAddresses } from '@/constants/contracts'
import { ChainMarkets, OpenPositionType, OrderDirection, PositionStatus, addressToAsset } from '@/constants/markets'
import { SupportedChainId } from '@/constants/network'
import { MaxUint256 } from '@/constants/units'
import { equal, notEmpty, sum, unique } from '@/utils/arrayUtils'
import { Big18Math } from '@/utils/big18Utils'
import { getProductContract } from '@/utils/contractUtils'
import { GraphDefaultPageSize, queryAll } from '@/utils/graphUtils'
import { InvokerAction, buildInvokerAction } from '@/utils/multiinvoker'
import { calcLiquidationPrice, next, side as positionSide, positionStatus, size } from '@/utils/positionUtils'
import { last24hrBounds } from '@/utils/timeUtils'

import { ICollateralAbi } from '@abi/ICollateral.abi'
import { LensAbi } from '@abi/Lens.abi'

import { gql } from '@t/gql'
import { GetAccountPositionsQuery, PositionSide } from '@t/gql/graphql'
import { ProductSnapshot, UserProductSnapshot } from '@t/perennial'

import {
  useCollateral,
  useLens,
  useLensProductSnapshot,
  useLensProtocolSnapshot,
  useLensUserProductSnapshot,
  useMultiInvoker,
  useUSDC,
} from './contracts'
import { useAddress, useChainId, useGraphClient, useWsProvider } from './network'
import { usePyth } from './network'

export type AssetSnapshots = {
  [key in SupportedAsset]?: {
    [OrderDirection.Long]?: ProductSnapshot
    [OrderDirection.Short]?: ProductSnapshot
  }
}
export const useChainAssetSnapshots = () => {
  const chainId = useChainId()
  const lens = useLensProductSnapshot()

  return useQuery({
    queryKey: ['assetSnapshots', chainId],
    queryFn: async () => {
      const assets = Object.keys(ChainMarkets[chainId]) as SupportedAsset[]
      const markets = assets
        .map((asset) => ChainMarkets[chainId][asset])
        .filter(notEmpty)
        .map((market) => [market.Long, market.Short].filter(notEmpty))
        .flat()

      const snapshots = await lens.read.snapshots([markets])

      return assets.reduce((acc, asset) => {
        const longSnapshot = snapshots.find((s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.Long)
        const shortSnapshot = snapshots.find(
          (s) => getAddress(s.productAddress) === ChainMarkets[chainId][asset]?.Short,
        )
        // Since we're directly returning the ethers result, we need to convert it to a POJO
        // so that react-query can correctly serialize it
        // TODO: when we switch to viem, we should be able to remove this
        acc[asset] = {
          [OrderDirection.Long]: longSnapshot ? longSnapshot : undefined,
          [OrderDirection.Short]: shortSnapshot ? shortSnapshot : undefined,
        }

        return acc
      }, {} as AssetSnapshots)
    },
  })
}

export const useProtocolSnapshot = () => {
  const chainId = useChainId()
  const lens = useLensProtocolSnapshot()

  return useQuery({
    queryKey: ['protocolSnapshot', chainId],
    enabled: !!chainId,
    queryFn: async () => {
      return lens.read.snapshot()
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
  const { address } = useAddress()
  const lens = useLens()
  const userLens = useLensUserProductSnapshot()
  const collateral = useCollateral()
  const graphClient = useGraphClient()
  const publicClient = usePublicClient()
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

      const accountSnapshots = await userLens.read.snapshots([address, markets])

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
              publicClient,
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
              publicClient,
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
export const useUserChainPositionHistory = (side: PositionSide) => {
  const chainId = useChainId()
  const graphClient = useGraphClient()
  const publicClient = usePublicClient()
  const { address } = useAddress()
  const lens = useLens()
  const productLens = useLensProductSnapshot()
  const userLens = useLensUserProductSnapshot()
  const collateral = useCollateral()

  return useInfiniteQuery({
    queryKey: ['userChainPositionHistory', chainId, side, address],
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
        query getPreviousAccountPositions($account: Bytes!, $products: [Bytes!]!, $side: PositionSide!, $first: Int!, $skip: Int!) {
          positions: productAccountPositions(
            where: { account: $account, product_in: $products, endBlock_gt: -1, side: $side }
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
        skip: PositionHistoryPageSize * (pageParam || 0),
        side,
      })

      const accountSnapshots = graphPositions.positions.map(async (graphPosition) => {
        const snapshot = await userLens.read.snapshot([address, getAddress(graphPosition.product)], {
          blockNumber: BigInt(graphPosition.endBlock),
        })
        const productSnapshot = await productLens.read.snapshot([getAddress(graphPosition.product)], {
          blockNumber: BigInt(graphPosition.endBlock),
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
          publicClient,
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
  lens: GetContractResult<typeof LensAbi>,
  collateralContract: GetContractResult<typeof ICollateralAbi>,
  graphClient: GraphQLClient,
  rpcClient: PublicClient,
  snapshot?: UserProductSnapshot,
  graphPosition?: GetAccountPositionsQuery['positions'][0],
  productSnapshot?: ProductSnapshot,
) => {
  if (!snapshot || !productSnapshot) return { asset, direction, currentCollateral: 0n, status: PositionStatus.resolved }
  const { productAddress, collateral, pre, position, openInterest, maintenance } = snapshot
  const nextNotional = Big18Math.abs(Big18Math.mul(size(next(pre, position)), productSnapshot.latestVersion.price))
  let side = positionSide(next(pre, position))

  // If no graph position, return snapshot values
  if (!graphPosition) {
    const positionSize = side === 'maker' ? snapshot.position.maker : snapshot.position.taker
    const nextPositionSize = side === 'maker' ? next(pre, position).maker : next(pre, position).taker
    return {
      asset,
      direction,
      position: positionSize,
      nextPosition: nextPositionSize,
      startCollateral: collateral,
      currentCollateral: collateral,
      averageEntry: productSnapshot.latestVersion.price,
      liquidationPrice: calcLiquidationPrice(productSnapshot, next(pre, position), collateral),
      notional: size(openInterest),
      nextNotional,
      leverage: collateral > 0n ? Big18Math.div(size(openInterest), collateral) : 0n,
      nextLeverage: collateral > 0n ? Big18Math.div(nextNotional, collateral) : 0n,
      maintenance,
      status: positionStatus(positionSize, nextPositionSize, collateral),
    }
  }
  const { startBlock, depositAmount, fees: _fees, endBlock, lastUpdatedBlockNumber, valuePnl } = graphPosition
  const closedPosition = BigInt(endBlock) > -1n
  // If the graph position is available, use that to find side as this might be a historical position with no
  // current position size
  side = graphPosition.side

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
        blockNumber_lte: $endBlock,
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
        blockNumber_lte: $endBlock,
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
        blockNumber_lte: $endBlock,
      }) {
        fee
        transactionHash
        blockNumber
        blockTimestamp
      }
      deposits(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
        blockNumber_lte: $endBlock,
      }, first: $first, skip: $skip) {
        amount
        transactionHash
        blockNumber
        blockTimestamp
      }
      withdrawals(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
        blockNumber_lte: $endBlock,
      }, first: $first, skip: $skip) {
        amount
        transactionHash
        blockNumber
        blockTimestamp
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
      endBlock: closedPosition ? endBlock : (BigInt(graphPosition.lastUpdatedBlockNumber) + 1n).toString(),
      taker: side === 'taker',
      first: GraphDefaultPageSize,
      skip: page * GraphDefaultPageSize,
    })
  })

  const collateralChanges = [
    ...positionChanges.deposits.map((d) => ({ ...d, amount: BigInt(d.amount), blockNumber: BigInt(d.blockNumber) })),
    ...positionChanges.withdrawals.map((w) => ({
      ...w,
      amount: -BigInt(w.amount),
      blockNumber: BigInt(w.blockNumber),
    })),
  ]
    .sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber))
    .filter((c) => BigInt(c.blockNumber) > BigInt(startBlock))

  // Merge opens and closes, sorting by blockNumber
  const positionsChangesMerged = (
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

  // Collateral at one block before the position was opened
  // We need the cast here because Viem overload handling is not working
  // TODO(arjun): remove cast when Viem fixes overload handling
  const intialCollateral = (await lens.read.collateral([address, productAddress], {
    blockNumber: BigInt(Number(startBlock) - 1),
  })) as bigint
  const initialDeposits =
    sum(
      positionChanges.deposits.filter((d) => BigInt(d.blockNumber) === BigInt(startBlock)).map((d) => BigInt(d.amount)),
    ) -
    sum(
      positionChanges.withdrawals
        .filter((d) => BigInt(d.blockNumber) === BigInt(startBlock))
        .map((d) => BigInt(d.amount)),
    )

  const startCollateral = intialCollateral + initialDeposits

  // Settle versions is change.version + 1 unless it is the latest version
  const settleVersions = unique(positionsChangesMerged.map((c) => BigInt(c.version))).flatMap((v) => [v, v + 1n])

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

  const productContract = getProductContract(productAddress, chainId)
  const currentVersion = productSnapshot.latestVersion
  const latestVersion = await productContract.read.latestVersion()
  // Get the post-settlement value
  const [, latestValue, latestPrice, currentValue] = await Promise.all([
    productContract.read.settle(),
    productContract.read.valueAtVersion([latestVersion + 1n]),
    productContract.read.atVersion([latestVersion + 1n]),
    productContract.read.valueAtVersion([currentVersion.version]),
  ])

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
  let currentCollateral = startCollateral
  const subPositions = positionsChangesMerged.map((change, i) => {
    const { version, amount } = change
    let settleVersion = BigInt(version) + 1n
    // If the settle version is ahead of currentVersion, set the settle version to the current version
    if (settleVersion > currentVersion.version) settleVersion = currentVersion.version
    const settleVersionData = atVersions.get(settleVersion)
    const settleValue =
      graphPosition.side === 'maker' ? settleVersionData?.makerValue ?? 0n : settleVersionData?.takerValue ?? 0n

    const prevVersion = i === 0 ? 0n : BigInt(positionsChangesMerged[i - 1].version) + 1n
    const prevVersionData = atVersions.get(prevVersion)
    const prevValue =
      graphPosition.side === 'maker' ? prevVersionData?.makerValue ?? 0n : prevVersionData?.takerValue ?? 0n

    const [blockNumber, blockTimestamp] = [BigInt(change.blockNumber), BigInt(change.blockTimestamp)]
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
      collateral: currentCollateral,
      blockNumber,
      blockTimestamp,
      transctionHash: change.transactionHash,
      collateralChanges: collateralChanges
        .filter(
          (c) =>
            c.blockNumber <= blockNumber &&
            (i > 0 ? c.blockNumber > BigInt(positionsChangesMerged[i - 1].blockNumber) : true),
        )
        .map((c) => c.amount),
    }

    currentPosition += subPosition.delta
    currentCollateral += subPosition.pnl + sum(subPosition.collateralChanges)
    return subPosition
  })

  // Average Entry = Total Notional / Total Size
  const averageEntry = Big18Math.div(
    sum(subPositions.filter((s) => s.delta > 0n).map((s) => Big18Math.mul(s.delta, s.settlePrice))),
    sum(subPositions.filter((s) => s.delta > 0n).map((s) => s.delta)),
  )

  let deposits = BigInt(depositAmount)

  // If this is the current position, pull values between graph head and chain head
  if (!closedPosition) {
    // Pull any deposits/withdrawals that have happened between graph syncs
    const [_deposits, _withdrawals] = await Promise.all([
      rpcClient.getLogs({
        address: collateralContract.address,
        event: getAbiItem({ abi: collateralContract.abi, name: 'Deposit' }),
        args: { user: address, product: productAddress },
        fromBlock: BigInt(positionChanges.meta?.block.number || lastUpdatedBlockNumber) + 1n,
        toBlock: 'latest',
        strict: true,
      }),
      rpcClient.getLogs({
        address: collateralContract.address,
        event: getAbiItem({ abi: collateralContract.abi, name: 'Withdrawal' }),
        args: { user: address, product: productAddress },
        fromBlock: BigInt(positionChanges.meta?.block.number || lastUpdatedBlockNumber) + 1n,
        toBlock: 'latest',
        strict: true,
      }),
    ])

    deposits = deposits + sum(_deposits.map((d) => d.args.amount)) - sum(_withdrawals.map((d) => d.args.amount))
  }

  const fees = BigInt(_fees)
  const positionSize = side === 'maker' ? position.maker : position.taker
  const nextPositionSize = side === 'maker' ? next(pre, position).maker : next(pre, position).taker
  return {
    asset,
    direction,
    product: productAddress,
    side,
    position: positionSize,
    nextPosition: nextPositionSize,
    startCollateral,
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
    pnl: closedPosition ? BigInt(valuePnl) - fees : collateral - startCollateral - deposits,
    collateralChanges,
    maintenance,
    status: positionStatus(positionSize, nextPositionSize, collateral),
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
  }, [markets, pyth])

  return prices
}

export type LivePrices = Awaited<ReturnType<typeof useChainLivePrices>>

export const useRefreshKeysOnPriceUpdates = (invalidKeys: string[] = ['userCurrentPositions', 'assetSnapshots']) => {
  const chainId = useChainId()
  const queryClient = useQueryClient()
  const [aggregators, setAggregators] = useState<string[]>([])
  const { data: products, isPreviousData } = useChainAssetSnapshots()
  const wsProvider = useWsProvider()

  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => invalidKeys.includes(queryKey.at(0) as string) && queryKey.includes(chainId),
      }),
    [invalidKeys, queryClient, chainId],
  )

  useEffect(() => {
    const fetchAggregatorAddresses = async () => {
      if (!products || isPreviousData) return

      // Product -> Perennial ChainlinkFeedOracle or ChainlinkOracle
      const productOracles = unique(
        Object.values(products).flatMap((p) =>
          [p.Long?.productInfo.oracle, p.Short?.productInfo.oracle].filter(notEmpty),
        ),
      )

      let aggregatorAddresses: Address[] = []

      // If mainnet or goerli, use registry
      if (mainnet.id === chainId) {
        const registryLookup = await Promise.all(
          productOracles.map(async (p) => {
            const [base, quote, registry] = await multicall({
              chainId: chainId,
              allowFailure: false,
              contracts: [
                {
                  address: getAddress(p),
                  abi: parseAbi(['function base() view returns (address)'] as const),
                  functionName: 'base',
                },
                {
                  address: getAddress(p),
                  abi: parseAbi(['function quote() view returns (address)'] as const),
                  functionName: 'quote',
                },
                {
                  address: getAddress(p),
                  abi: parseAbi(['function registry() view returns (address)'] as const),
                  functionName: 'registry',
                },
              ],
            })

            return { base, quote, registry }
          }),
        )

        // Registry -> Aggregator
        // TODO(arjun): Investigate why the casts are necessary here
        aggregatorAddresses = (await multicall({
          chainId,
          allowFailure: false,
          contracts: registryLookup.map((p) => ({
            address: p.registry,
            abi: parseAbi(['function getFeed(address base, address quote) view returns (address)'] as const),
            functionName: 'getFeed',
            args: [p.base, p.quote],
          })),
        })) as Address[]
      } else {
        // Some goerli products use a legacy oracle which uses 'feed' instead of 'aggregator'
        const aggregatorAbi = parseAbi([
          'function aggregator() view returns (address)',
          'function feed() view returns (address)',
        ] as const)

        // Feed Oracle -> Proxy
        // TODO(arjun): Investigate why the casts are necessary here
        const proxyAddresses = (await multicall({
          chainId,
          allowFailure: false,
          contracts: productOracles.map((p) => ({
            address: getAddress(p),
            abi: aggregatorAbi,
            functionName: goerli.id === chainId ? 'feed' : 'aggregator',
          })),
        })) as Address[]

        // Proxy -> Aggregator
        // TODO(arjun): Investigate why the casts are necessary here
        aggregatorAddresses = (await multicall({
          chainId,
          allowFailure: false,
          contracts: proxyAddresses.map((p) => ({
            address: p,
            abi: aggregatorAbi,
            functionName: 'aggregator',
          })),
        })) as Address[]
      }

      setAggregators((currAggregators) => {
        if (equal(currAggregators, aggregatorAddresses)) return currAggregators
        return aggregatorAddresses
      })
    }

    fetchAggregatorAddresses()
  }, [products, chainId, isPreviousData])

  useEffect(() => {
    if (!aggregators.length || !wsProvider) return
    // Ideally we could use wagmi for this, but they don't support eth_subscribe
    // TODO(arjun): Use viem/wagmi when they support eth_subscribe
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

export const useProductTransactions = (productAddress?: Address) => {
  const { chain } = useNetwork()
  const chainId = useChainId()
  const { address } = useAddress()
  const { data: walletClient } = useWalletClient()

  const multiInvoker = useMultiInvoker(walletClient ?? undefined)
  const usdcContract = useUSDC(walletClient ?? undefined)

  const queryClient = useQueryClient()

  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          ['userCurrentPositions', 'balances'].includes(queryKey.at(0) as string) && queryKey.includes(chainId),
      }),
    [queryClient, chainId],
  )

  const txOpts = { account: address || zeroAddress, chainId, chain }
  const onApproveUSDC = async () => {
    const hash = await usdcContract.write.approve([MultiInvokerAddresses[chainId], MaxUint256], txOpts)
    await waitForTransaction({ hash })
    await refresh()
  }

  const onModifyPosition = async (
    collateralDelta: bigint,
    positionSide: OpenPositionType,
    positionDelta: bigint,
    { crossProduct, crossCollateral }: { crossProduct?: Address; crossCollateral?: bigint } = {},
  ) => {
    if (!address || !chainId || !walletClient) {
      return
    }

    let collateralAction: InvokerAction = InvokerAction.NOOP
    if (collateralDelta > 0n) {
      collateralAction = InvokerAction.WRAP_AND_DEPOSIT
    } else if (collateralDelta < 0n) {
      collateralAction = InvokerAction.WITHDRAW_AND_UNWRAP
    }

    let positionAction: InvokerAction = InvokerAction.NOOP
    if (positionDelta > 0n) {
      positionAction = positionSide === 'maker' ? InvokerAction.OPEN_MAKE : InvokerAction.OPEN_TAKE
    } else if (positionDelta < 0n) {
      positionAction = positionSide === 'maker' ? InvokerAction.CLOSE_MAKE : InvokerAction.CLOSE_TAKE
    }

    const orderedActions = [
      buildInvokerAction(collateralAction, {
        productAddress,
        userAddress: address,
        amount: Big18Math.abs(collateralDelta),
      }),
      buildInvokerAction(positionAction, {
        productAddress,
        userAddress: address,
        position: Big18Math.abs(positionDelta),
      }),
    ].filter(({ action }) => !Big18Math.eq(BigInt(action), BigInt(InvokerAction.NOOP)))

    // If we have collateral in another product, withdraw it first
    if (crossProduct && crossCollateral) {
      orderedActions.unshift(
        buildInvokerAction(InvokerAction.WITHDRAW_AND_UNWRAP, {
          productAddress: crossProduct,
          userAddress: address,
          amount: crossCollateral,
        }),
      )
    }

    const hash = await multiInvoker.write.invoke([orderedActions], txOpts)
    await waitForTransaction({ hash })
    await refresh()
  }
  return {
    onApproveUSDC,
    onModifyPosition,
  }
}
