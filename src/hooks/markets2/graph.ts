import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query'
import { GraphQLClient } from 'graphql-request'
import { Address, getAddress } from 'viem'

import {
  ChainMarkets2,
  PositionSide2,
  SupportedAsset,
  addressToAsset2,
  chainAssetsWithAddress,
} from '@/constants/markets'
import { STIPDropParams, STIPSeasonNumber } from '@/constants/stipDrop'
import { AccumulatorTypes, RealizedAccumulations, accumulateRealized } from '@/utils/accumulatorUtils'
import { notEmpty, sum } from '@/utils/arrayUtils'
import { Big6Math, BigOrZero } from '@/utils/big6Utils'
import { GraphDefaultPageSize, queryAll } from '@/utils/graphUtils'
import { calcNotional, calcPriceImpactFromTradeFee, calcSTIPFeeRebate, magnitude, side2 } from '@/utils/positionUtils'
import { Day, Hour, last7dBounds, last24hrBounds, nowSeconds, timeToSeconds } from '@/utils/timeUtils'

import { gql } from '@t/gql'
import { MarketsAccountCheckpointsQuery, PositionSide } from '@t/gql/graphql'

import { useAddress, useChainId, useGraphClient } from '../network'
import { useMarketSnapshots2 } from './chain'

export const useActivePositionMarketPnls = () => {
  const chainId = useChainId()
  const { data: marketSnapshots, isLoading: marketSnapshotsLoading } = useMarketSnapshots2()
  const { address } = useAddress()
  const graphClient = useGraphClient()
  const markets = chainAssetsWithAddress(chainId)

  // Query Checkpoints for each market - note that we don't query for a specific type because if we query for
  // `open` we might get the position before the latest position
  const queryAccountCheckpoints = gql(`
    query AccountCheckpoints($account: Bytes!, $market: Bytes!) {
      marketAccountCheckpoints(
        where: { account: $account, market: $market }
        orderBy: blockNumber, orderDirection: desc, first: 1
      ) { market, account, type, blockNumber, version }
    }
  `)

  // Query the market accumulators for each market. These are used to get data between the latest account settlement
  // and the latest global settlement
  const queryMarketAccumulatorsAndFirstUpdate = gql(`
    query MarketAccumulators($market: Bytes!, $account: Bytes!, $accountLatestVersion: BigInt!) {
      start: marketAccumulators(
        where: { market: $market, version: $accountLatestVersion, latest: false }
      ) {
        market, version
        makerValue, longValue, shortValue,
        pnlMaker, pnlLong, pnlShort,
        fundingMaker, fundingLong, fundingShort,
        interestMaker, interestLong, interestShort,
        positionFeeMaker
      }
      latest: marketAccumulators(
        where: { market: $market, latest: true }
      ) {
        market, version
        makerValue, longValue, shortValue,
        pnlMaker, pnlLong, pnlShort,
        fundingMaker, fundingLong, fundingShort,
        interestMaker, interestLong, interestShort,
        positionFeeMaker
      }
      firstUpdate: updateds(
        where: { market: $market, account: $account, version: $accountLatestVersion }
      ) { interfaceFee, orderFee }
    }
  `)

  const queryResults = useQueries({
    queries: markets.map((market) => {
      const { asset, marketAddress } = market
      return {
        queryKey: ['marketPnls2', chainId, address, asset],
        enabled: !!address && !!marketSnapshots && !!marketSnapshots.user && !marketSnapshotsLoading,
        queryFn: async () => {
          if (!address || !marketSnapshots || !marketSnapshots.user) return

          const checkpointData = await graphClient.request(queryAccountCheckpoints, {
            account: address,
            market: marketAddress,
          })

          const isFetchable =
            checkpointData.marketAccountCheckpoints?.[0] && checkpointData.marketAccountCheckpoints?.[0].type === 'open'

          const graphPosition = isFetchable
            ? await fetchPositionData({
                graphClient,
                address,
                market: getAddress(checkpointData.marketAccountCheckpoints[0].market),
                endVersion: null,
                startVersion: BigInt(checkpointData.marketAccountCheckpoints[0].version),
              })
            : null

          const lastSettlementSnapshot = marketSnapshots.user[asset].pendingPositions[0].timestamp
          const lastSettlement = graphPosition?.endVersion ? BigInt(graphPosition.endVersion) : lastSettlementSnapshot

          const marketAccumulators = await graphClient.request(queryMarketAccumulatorsAndFirstUpdate, {
            market: marketAddress,
            account: address,
            accountLatestVersion: lastSettlement.toString(),
          })

          const snapshot = marketSnapshots.user[asset]
          const [side, magnitude] = [
            snapshot.nextSide === 'none' ? snapshot.side : snapshot.nextSide,
            snapshot.nextMagnitude,
          ]
          let interfaceFees = BigOrZero(marketAccumulators?.firstUpdate.at(0)?.interfaceFee)
          let orderFees = BigOrZero(marketAccumulators?.firstUpdate.at(0)?.orderFee)
          let startCollateral = snapshot.pre.local.collateral
          let netDeposits = 0n
          let keeperFees = snapshot.pendingPositions[0].keeper
          let positionFees = snapshot.pendingPositions[0].fee
          const pendingPriceImpactFee = calcPriceImpactFromTradeFee({
            totalTradeFee: snapshot.pre.nextPosition.fee,
            positionFee: marketSnapshots.market[snapshot.asset].parameter.positionFee,
          })
          let priceImpactFees = pendingPriceImpactFee
          const priceImpact = magnitude > 0n ? Big6Math.div(pendingPriceImpactFee, magnitude) : 0n

          let averageEntryPrice = snapshot.prices[0]
          if (side === 'long') averageEntryPrice = averageEntryPrice + priceImpact
          if (side === 'short') averageEntryPrice = averageEntryPrice - priceImpact
          if (graphPosition) {
            // Start collateral is netDeposits + accumulatedCollateral immediately before start, plus deposits that occurred
            // on the start block
            startCollateral = graphPosition.startCollateral

            // Average entry is (openNotionalNow - openNotionalBeforeStart + pendingNotionalDeltaIfPositive) / (openSizeNow - openSizeBeforeStart - pendingSizeDeltaIfPositive)
            const pendingDelta = side !== 'none' ? snapshot.pre.nextPosition[side] - snapshot.pre.position[side] : 0n
            const pendingNotional = Big6Math.mul(pendingDelta, snapshot.prices[0])
            // Add price impact fee for taker positions
            let avgEntryNumerator = graphPosition.openNotional + (pendingDelta > 0n ? pendingNotional : 0n)
            if (side === 'long')
              avgEntryNumerator = avgEntryNumerator + graphPosition.openPriceImpactFees + pendingPriceImpactFee
            if (side === 'short')
              avgEntryNumerator = avgEntryNumerator - graphPosition.openPriceImpactFees - pendingPriceImpactFee
            averageEntryPrice = Big6Math.div(
              avgEntryNumerator,
              graphPosition.openSize + (pendingDelta > 0n ? pendingDelta : 0n),
            )

            // Current values are deltas between now and start
            netDeposits = graphPosition.netDeposits
            keeperFees = keeperFees + graphPosition.keeperFees
            positionFees = positionFees + graphPosition.positionFees
            priceImpactFees = priceImpactFees + graphPosition.priceImpactFees
            interfaceFees = graphPosition.interfaceFees
            orderFees = graphPosition.orderFees
          }
          const accumulatedValues = AccumulatorTypes.map(({ type, unrealizedKey }) => {
            if (side === 'none') return { type, realized: 0n, unrealized: 0n, total: 0n }

            // Pnl from start to latest account settlement
            const realized = graphPosition?.accumulated[type] || 0n

            // Pnl from latest account settlement to latest global settlement
            let unrealized = 0n
            if (marketAccumulators?.start[0] && marketAccumulators?.latest[0]) {
              if ((side === 'maker' && type === 'makerPositionFee') || type !== 'makerPositionFee') {
                unrealized = Big6Math.mul(
                  BigInt(marketAccumulators.latest[0][unrealizedKey[side]]) -
                    BigInt(marketAccumulators.start[0][unrealizedKey[side]]),
                  magnitude,
                )
              }
            }

            return { type, realized, unrealized, total: realized + unrealized }
          })

          // Add interface + order fee as part of start collateral since it is deducted from deposit and collateral balance
          const realtimePnl = snapshot.local.collateral - (startCollateral + netDeposits + interfaceFees + orderFees)
          const percentDenominator = startCollateral + (netDeposits > 0n ? netDeposits : 0n) + interfaceFees + orderFees
          const accumulatedPnl = AccumulatorTypes.reduce((acc, { type }) => {
            let pnl = accumulatedValues.find((v) => v.type === type)?.total ?? 0n
            // If this is a taker position, we need to subtract the price impact fees from the pnl and total
            if ((type === 'pnl' || type === 'value') && side !== 'maker') pnl = pnl - priceImpactFees
            return { ...acc, [type]: pnl }
          }, {} as RealizedAccumulations)

          return {
            startCollateral,
            realtime: realtimePnl,
            realtimePercent: !Big6Math.isZero(percentDenominator)
              ? Big6Math.abs(Big6Math.div(realtimePnl, percentDenominator))
              : 0n,
            realtimePercentDenominator: percentDenominator,
            accumulatedPnl,
            keeperFees,
            positionFees,
            priceImpactFees,
            interfaceFees,
            orderFees,
            averageEntryPrice,
            liquidation: !!graphPosition?.liquidation,
            liquidationFee: graphPosition?.liquidationFee ?? 0n,
          }
        },
      }
    }),
  })

  const pnlData = queryResults.reduce(
    (acc, queryResult, index) => {
      const asset = markets[index].asset
      if (!queryResult.data) return acc
      acc[asset] = queryResult.data
      return acc
    },
    {} as Record<
      string,
      {
        startCollateral: bigint
        realtime: bigint
        realtimePercent: bigint
        realtimePercentDenominator: bigint
        accumulatedPnl: RealizedAccumulations
        keeperFees: bigint
        positionFees: bigint
        priceImpactFees: bigint
        interfaceFees: bigint
        orderFees: bigint
        averageEntryPrice: bigint
        liquidation: boolean
        liquidationFee: bigint
      }
    >,
  )

  const isFetching = queryResults.some((r) => r.isFetching)
  const isLoading = queryResults.some((r) => r.isLoading)

  return {
    data: isLoading ? undefined : pnlData,
    isLoading,
    isFetching,
  }
}

export type ActiveSubPositionHistory = NonNullable<
  NonNullable<Awaited<ReturnType<typeof useActiveSubPositionHistory>['data']>>['pages'][number]
>['changes']

const ActivePositionHistoryPageSize = 100
export const useActiveSubPositionHistory = (asset: SupportedAsset, enabled: boolean = true) => {
  const chainId = useChainId()
  const { data: marketSnapshots, isLoading: marketSnapshotsLoading } = useMarketSnapshots2()
  const { address } = useAddress()
  const graphClient = useGraphClient()

  return useInfiniteQuery({
    queryKey: ['activeSubPositionHistory', chainId, asset, address],
    enabled: !!address && !marketSnapshotsLoading && !!marketSnapshots?.user?.[asset] && enabled,
    queryFn: async ({ pageParam = 0 }) => {
      if (!address || !marketSnapshots?.user?.[asset]) return
      const market = marketSnapshots.user[asset].market

      // Query for both the open and close checkpoint. The starting version is the greater of the two versions
      const queryAccountCloseCheckpoints = gql(`
        query CloseAccountCheckpoints($account: Bytes!, $market: Bytes!) {
          close: marketAccountCheckpoints(
            where: { account: $account, market: $market, type: close }
            orderBy: blockNumber, orderDirection: desc, first: 1
          ) { market, account, type, version }
          open: marketAccountCheckpoints(
            where: { account: $account, market: $market, type: open }
            orderBy: blockNumber, orderDirection: desc, first: 1
          ) { market, account, type, version }
        }
      `)
      const { close, open } = await graphClient.request(queryAccountCloseCheckpoints, { account: address, market })

      // Use the greater of the two versions as the starting version
      const startVersion = Big6Math.max(BigOrZero(close[0]?.version) + 1n, BigOrZero(open[0]?.version))

      const { changes, hasMore } = await fetchSubPositions({
        graphClient,
        market,
        address,
        startVersion,
        first: ActivePositionHistoryPageSize,
        skip: pageParam * ActivePositionHistoryPageSize,
      })

      return {
        changes,
        nextCursor: hasMore ? pageParam + 1 : undefined,
        checkpoint: { close: close[0], open: open[0] },
      }
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? 0,
  })
}

const HistoricalPositionsPageSize = 10
export type HistoricalPosition = NonNullable<
  NonNullable<ReturnType<typeof useHistoricalPositions>['data']>['pages'][number]
>['positions'][number]
export const useHistoricalPositions = (maker: boolean) => {
  const chainId = useChainId()
  const markets = chainAssetsWithAddress(chainId)
  const { address } = useAddress()
  const graphClient = useGraphClient()

  return useInfiniteQuery({
    queryKey: ['historicalPositions', chainId, maker ? 'maker' : 'taker', address],
    enabled: !!address && !!markets.length,
    queryFn: async ({ pageParam }: { pageParam?: { page: number; checkpoints?: MarketsAccountCheckpointsQuery } }) => {
      if (!address || !markets.length) return

      const queryMarketsAccountCheckpoints = gql(`
        query MarketsAccountCheckpoints(
          $account: Bytes!, $markets: [Bytes!]!, $sides: [PositionSide!]!, $first: Int!, $skip: Int!
        ) {
          marketAccountCheckpoints(
            where: { account: $account, market_in: $markets, side_in: $sides },
            orderBy: version, orderDirection: desc, first: $first, skip: $skip
          ) { market, account, type, version, blockNumber }
        }
      `)
      const checkpoints =
        pageParam?.checkpoints ??
        (await queryAll(async (pageNumber: number) =>
          graphClient.request(queryMarketsAccountCheckpoints, {
            account: address,
            markets: markets.map(({ marketAddress }) => marketAddress),
            first: GraphDefaultPageSize,
            skip: pageNumber * GraphDefaultPageSize,
            sides: maker ? [PositionSide.Maker] : [PositionSide.Long, PositionSide.Short],
          }),
        ))

      const pageNumber = pageParam?.page ?? 0
      const closes = checkpoints.marketAccountCheckpoints
        .filter((c) => c.type === 'close')
        .slice(pageNumber * HistoricalPositionsPageSize, (pageNumber + 1) * HistoricalPositionsPageSize)

      const positionsData = await Promise.all(
        closes.map(async (c) => {
          // Find the corresponding open
          const open = checkpoints.marketAccountCheckpoints.find(
            (cc) => cc.type === 'open' && cc.market === c.market && Number(cc.blockNumber) < Number(c.blockNumber),
          )

          if (!open) return

          const data = await fetchPositionData({
            graphClient,
            address,
            market: getAddress(c.market),
            startVersion: BigInt(open.version),
            endVersion: BigInt(c.version),
          })

          return data
        }),
      )

      const positions = positionsData.filter(notEmpty)

      return {
        positions,
        nextPageParam:
          closes.length === HistoricalPositionsPageSize
            ? {
                page: (pageParam?.page ?? 0) + 1,
                checkpoints,
              }
            : undefined,
      }
    },
    getNextPageParam: (lastPage) => lastPage?.nextPageParam,
  })
}

async function fetchPositionData({
  graphClient,
  address,
  market,
  startVersion,
  endVersion,
}: {
  graphClient: GraphQLClient
  address: Address
  market: Address
  startVersion: bigint
  endVersion: bigint | null
}) {
  const asset = addressToAsset2(market)
  if (!asset) return

  const accountPositionCheckpointDeltas = gql(`
    query MarketAccountCheckpointDeltas(
      $account: Bytes!, $market: Bytes!, $startVersion: BigInt!, $endVersion: BigInt!
    ) {
      start: marketAccountCheckpoints(
        where: { market: $market, account: $account, version: $startVersion },
      ) {
        market, accumulatedValue, accumulatedCollateral, openSize, openNotional, openPriceImpactFees, accumulatedPositionFees
        accumulatedKeeperFees, accumulatedPnl, accumulatedFunding, accumulatedInterest, accumulatedMakerPositionFee,
        accumulatedPriceImpactFees, accumulatedInterfaceFees, accumulatedOrderFees, collateral, netDeposits, side, startMagnitude, blockTimestamp, transactionHash
      }
      end: marketAccountCheckpoints(
        where: { market: $market, account: $account, version: $endVersion },
      ) {
        market, accumulatedValue, accumulatedCollateral, openSize, openNotional, openPriceImpactFees, accumulatedPositionFees
        accumulatedKeeperFees, accumulatedPnl, accumulatedFunding, accumulatedInterest, accumulatedMakerPositionFee,
        accumulatedPriceImpactFees, accumulatedInterfaceFees, accumulatedOrderFees, collateral, netDeposits
      }
      currentPosition: marketAccountPositions(
        where: { market: $market, account: $account },
      ) {
        market, accumulatedValue, accumulatedCollateral, openSize, openNotional, openPriceImpactFees, accumulatedPositionFees
        accumulatedKeeperFees, accumulatedPnl, accumulatedFunding, accumulatedInterest, accumulatedMakerPositionFee,
        accumulatedPriceImpactFees, accumulatedInterfaceFees, accumulatedOrderFees, collateral, netDeposits
      }
      startUpdate: updateds(
        where: { market: $market, account: $account, version: $startVersion },
      ) { price, priceImpactFee, interfaceFee, orderFee }
      endUpdate: updateds(
        where: { market: $market, account: $account, version_lte: $endVersion },
        first: 1, orderBy: version, orderDirection: desc
      ) { protect, collateral, version }
      firstAccumulation: accountPositionProcesseds(
        where: { market: $market, account: $account, toOracleVersion: $startVersion }
      ) { accumulationResult_positionFee, accumulationResult_keeper, priceImpactFee }
      finalAccumulation: accountPositionProcesseds(
        where: { market: $market, account: $account, fromOracleVersion: $endVersion }
      ) { accumulationResult_positionFee, accumulationResult_keeper, priceImpactFee }
    }
  `)

  const positionData = await graphClient.request(accountPositionCheckpointDeltas, {
    account: address,
    market,
    startVersion: startVersion.toString(),
    endVersion: endVersion !== null ? endVersion.toString() : nowSeconds().toString(),
  })

  const startUpdate = positionData?.startUpdate.at(0)
  const endUpdate = positionData?.endUpdate.at(0)
  const firstAccumulation = positionData?.firstAccumulation?.at(0)
  const finalAccumulation = positionData?.finalAccumulation?.at(0)

  const start = positionData?.start.at(0)
  const end = positionData?.end.at(0) ?? positionData?.currentPosition.at(0)

  if (!startUpdate || !endUpdate || !start || !end) return

  const startSize = BigInt(start.startMagnitude)
  const side =
    start.side === 'maker' ? PositionSide2.maker : start.side === 'long' ? PositionSide2.long : PositionSide2.short
  const startCollateral =
    BigInt(start.collateral) +
    BigOrZero(firstAccumulation?.accumulationResult_positionFee) +
    BigOrZero(firstAccumulation?.accumulationResult_keeper)
  const netDeposits = BigOrZero(end.netDeposits) - BigOrZero(start.netDeposits)
  const openNotional = BigOrZero(end.openNotional) - BigOrZero(start.openNotional)
  const openPriceImpactFees = BigOrZero(end.openPriceImpactFees) - BigOrZero(start.openPriceImpactFees)
  const openSize = BigOrZero(end.openSize) - BigOrZero(start.openSize)

  let avgEntryNumerator = openNotional
  let startPrice = BigOrZero(startUpdate.price)

  // Factor in price impact fees for takers
  if (side === 'long') {
    startPrice = startPrice + BigOrZero(startUpdate.priceImpactFee)
    avgEntryNumerator = avgEntryNumerator + openPriceImpactFees
  }
  if (side === 'short') {
    startPrice = startPrice - BigOrZero(startUpdate.priceImpactFee)
    avgEntryNumerator = avgEntryNumerator - openPriceImpactFees
  }

  const position = {
    market,
    asset,
    side: side === 'maker' ? PositionSide2.maker : side === 'long' ? PositionSide2.long : PositionSide2.short,
    startTime: new Date(Number(start.blockTimestamp) * 1000),
    startTransactionHash: start.transactionHash,
    startSize,
    startVersion,
    endVersion: endVersion === null ? BigInt(endUpdate.version) : endVersion,
    startPrice,
    startCollateral,
    netDeposits,
    liquidation: endUpdate.protect,
    liquidationFee: endUpdate.protect ? Big6Math.abs(BigInt(endUpdate.collateral)) : 0n,
    openNotional,
    openSize,
    openPriceImpactFees,
    averageEntry: openSize > 0n ? Big6Math.div(avgEntryNumerator, openSize) : 0n,
    accumulated: AccumulatorTypes.map((type) => ({
      [type.type]: BigOrZero(end[type.realizedKey]) - BigOrZero(start[type.realizedKey]),
    })).reduce((acc, v) => ({ ...acc, ...v }), {} as RealizedAccumulations) as RealizedAccumulations,
    keeperFees:
      BigOrZero(end.accumulatedKeeperFees) -
      BigOrZero(start.accumulatedKeeperFees) +
      BigOrZero(firstAccumulation?.accumulationResult_keeper) +
      BigOrZero(finalAccumulation?.accumulationResult_keeper),
    positionFees:
      BigOrZero(end.accumulatedPositionFees) -
      BigOrZero(start.accumulatedPositionFees) +
      BigOrZero(firstAccumulation?.accumulationResult_positionFee) +
      BigOrZero(finalAccumulation?.accumulationResult_positionFee),
    priceImpactFees:
      BigOrZero(end.accumulatedPriceImpactFees) -
      BigOrZero(start.accumulatedPriceImpactFees) +
      BigOrZero(firstAccumulation?.priceImpactFee) +
      BigOrZero(finalAccumulation?.priceImpactFee),
    interfaceFees:
      BigOrZero(startUpdate.interfaceFee) +
      BigOrZero(end.accumulatedInterfaceFees) -
      BigOrZero(start.accumulatedInterfaceFees),
    orderFees:
      BigOrZero(startUpdate.orderFee) + BigOrZero(end.accumulatedOrderFees) - BigOrZero(start.accumulatedOrderFees),
  }

  return position
}

const HistoricalSubPositionsPageSize = 100
export const useHistoricalSubPositions = ({
  market,
  startVersion,
  endVersion,
  enabled,
}: {
  market: Address
  startVersion: string
  endVersion: string
  enabled?: boolean
}) => {
  const chainId = useChainId()
  const graphClient = useGraphClient()
  const { address } = useAddress()

  return useInfiniteQuery({
    queryKey: ['historicalSubPositions', chainId, market, startVersion, endVersion, address],
    enabled: !!address && enabled,
    queryFn: async ({ pageParam = 0 }) => {
      if (!address) return
      const { changes, hasMore } = await fetchSubPositions({
        graphClient,
        address,
        market: market,
        startVersion: BigInt(startVersion),
        endVersion: BigInt(endVersion),
        first: HistoricalSubPositionsPageSize,
        skip: pageParam * HistoricalSubPositionsPageSize,
      })

      return { changes, nextPageParam: hasMore ? pageParam + 1 : undefined }
    },
    getNextPageParam: (lastPage) => lastPage?.nextPageParam,
  })
}

export type SubPositionChange = Awaited<ReturnType<typeof fetchSubPositions>>['changes'][number]
async function fetchSubPositions({
  graphClient,
  address,
  market,
  startVersion,
  endVersion,
  first,
  skip,
}: {
  graphClient: GraphQLClient
  address: Address
  market: Address
  startVersion: bigint
  endVersion?: bigint
  first: number
  skip: number
}) {
  const accountUpdatesQuery = gql(`
    query fetchSubPositions_AccountUpdates(
      $account: Bytes!, $market: Bytes!, $startVersion: BigInt!, $endVersion: BigInt! $first: Int!, $skip: Int!
    ) {
      updateds(
        where: { market: $market, account: $account, version_gte: $startVersion, version_lte: $endVersion },
        orderBy: version, orderDirection: desc, first: $first, skip: $skip
      ) {
        version, collateral, newMaker, newLong, newShort, valid, transactionHash, price, priceImpactFee,
        localPositionId, globalPositionId, market, account, blockNumber, blockTimestamp, protect, interfaceFee, orderFee
      }

      accountPositionProcesseds(
        where: {
          market: $market, account: $account, toOracleVersion_gte: $startVersion, fromOracleVersion_lte: $endVersion
        },
        orderBy: toOracleVersion, orderDirection: desc
      ) {
        accumulationResult_collateralAmount, accumulationResult_keeper, accumulationResult_positionFee, priceImpactFee
        accumulatedPnl, accumulatedFunding, accumulatedInterest, accumulatedMakerPositionFee, accumulatedValue
        side, size, fromOracleVersion, toOracleVersion, toVersionPrice, toVersionValid, collateral, blockNumber
      }

      nextUpdate: updateds(
        where: { market: $market, account: $account, version_gt: $endVersion },
        orderBy: version, orderDirection: asc, first: 1
      ) {
        version, collateral, newMaker, newLong, newShort, valid, transactionHash, price, priceImpactFee,
        localPositionId, globalPositionId, market, account, blockNumber, blockTimestamp, protect, interfaceFee, orderFee
      }
    }
  `)

  const { updateds, accountPositionProcesseds, nextUpdate } = await graphClient.request(accountUpdatesQuery, {
    account: address,
    market,
    startVersion: startVersion.toString(),
    endVersion: endVersion ? endVersion.toString() : nowSeconds().toString(),
    first,
    skip,
  })

  // Pull execution price for the most recent update
  if (updateds[0] && !updateds[0].valid) {
    const price = await getPriceAtVersion({ graphClient, market, version: BigInt(updateds[0].version) })
    if (price)
      updateds[0] = {
        ...updateds[0],
        price,
        valid: BigInt(price) > 0n,
      }
  }

  const changes = updateds
    .filter((update, i) =>
      i === updateds.length - 1
        ? magnitude(update.newMaker, update.newLong, update.newShort) > 0n // skip update if it has no size
        : true,
    )
    .map((update, i, self) => {
      const accumulations = accountPositionProcesseds.filter(
        (p) =>
          BigInt(p.toOracleVersion) >= BigInt(update.version) &&
          (i > 0 ? BigInt(p.toOracleVersion) < BigInt(self[i - 1].version) : true),
      )

      const magnitude_ = magnitude(update.newMaker, update.newLong, update.newShort)
      const side = side2(update.newMaker, update.newLong, update.newShort)
      const prevValid = self.find((u) => u.version < update.version && u.valid)
      const prevSide = prevValid ? side2(prevValid.newMaker, prevValid.newLong, prevValid.newShort) : PositionSide2.none
      const delta =
        (prevValid && update.valid) || (prevValid && !update.valid && i === 0)
          ? magnitude_ - magnitude(prevValid.newMaker, prevValid.newLong, prevValid.newShort)
          : BigInt(update.version) === startVersion || i === self.length - 1
          ? magnitude_
          : null

      let priceWithImpact = BigInt(update.price)

      const realizedValues = accumulateRealized(accumulations)

      // Handle price impact. This is the price plus/minus the price impact fee divided by the delta. This is
      // directional - long opens and short closes increase the price, short opens and long closes decrease the price
      if (!!delta && (side === 'long' || prevSide === 'long'))
        priceWithImpact = priceWithImpact + Big6Math.div(BigOrZero(update.priceImpactFee), delta)
      if (!!delta && (side === 'short' || prevSide === 'short'))
        priceWithImpact = priceWithImpact - Big6Math.div(BigOrZero(update.priceImpactFee), delta)
      // If taker, subtract the price impact fee from the realized pnl
      if (side !== 'maker') realizedValues.pnl = realizedValues.pnl - BigInt(update.priceImpactFee)

      return {
        ...update,
        magnitude: magnitude_,
        priceWithImpact,
        delta,
        accumulations,
        realizedValues,
        collateralOnly: delta === 0n && BigOrZero(update.collateral) !== 0n,
      }
    })

  // Check if the next update is a collateral only change, and if so pull it in as a new update that is part of this
  // position. This is done because the graph does not include collateral only updates as part of the checkpointing
  // system, but it's a nicer UX if we include them as part of the position history
  if (
    nextUpdate[0] &&
    BigInt(nextUpdate[0].collateral) < 0n &&
    magnitude(nextUpdate[0].newMaker, nextUpdate[0].newLong, nextUpdate[0].newShort) === 0n
  ) {
    if (changes[0].accumulations[0].toOracleVersion <= nextUpdate[0].version) {
      changes.unshift({
        ...nextUpdate[0],
        magnitude: 0n,
        priceWithImpact: 0n,
        delta: null,
        accumulations: [],
        realizedValues: accumulateRealized([]),
        collateralOnly: true,
      })
    }
  }

  return { changes, hasMore: updateds.length === first }
}

export type OpenOrder = NonNullable<
  NonNullable<Awaited<ReturnType<typeof useOpenOrders>['data']>>['pages'][number]
>['openOrders'][number]

const OpenOrdersPageSize = 1000
export const useOpenOrders = (isMaker?: boolean) => {
  const chainId = useChainId()
  const { address } = useAddress()
  const graphClient = useGraphClient()
  const markets = chainAssetsWithAddress(chainId)

  return useInfiniteQuery({
    queryKey: ['openOrders', chainId, address, isMaker ? 'maker' : 'taker'],
    enabled: !!address && !!markets.length,
    queryFn: async ({ pageParam = 0 }) => {
      if (!address || !markets.length) return

      const queryOpenOrders = gql(`
        query OpenOrders($account: Bytes!, $markets: [Bytes!]!, $side: [Int!]!, $first: Int!, $skip: Int!) {
          multiInvokerOrderPlaceds(
            where: { account: $account, market_in: $markets, cancelled: false, executed: false, order_side_in: $side },
            orderBy: nonce, orderDirection: desc, first: $first, skip: $skip
          ) {
              account, market, nonce, order_side, order_comparison, order_fee, order_price, order_delta
              blockNumber, blockTimestamp, transactionHash
            }
        }
      `)

      const { multiInvokerOrderPlaceds: openOrders } = await graphClient.request(queryOpenOrders, {
        account: address,
        markets: markets.map(({ marketAddress }) => marketAddress),
        first: OpenOrdersPageSize,
        skip: pageParam * OpenOrdersPageSize,
        side: isMaker ? [0, 3] : [1, 2, 3], // 4 = collateral withdrawal
      })

      return {
        openOrders,
        nextPageParam: openOrders.length === OpenOrdersPageSize ? pageParam + 1 : undefined,
      }
    },
    getNextPageParam: (lastPage) => lastPage?.nextPageParam,
  })
}

export const useMarket24hrData = (asset: SupportedAsset) => {
  const chainId = useChainId()
  const graphClient = useGraphClient()
  const market = ChainMarkets2[chainId][asset]

  return useQuery({
    queryKey: ['market24hData', chainId, asset],
    enabled: !!market,
    queryFn: async () => {
      if (!market) return

      const { from, to } = last24hrBounds()

      const query = gql(`
        query Market24hrData($market: Bytes!, $from: BigInt!, $to: BigInt!) {
          volume: bucketedVolumes(
            where:{bucket: hourly, market: $market, periodStartTimestamp_gte: $from, periodStartTimestamp_lte: $to}
            orderBy: periodStartTimestamp
            orderDirection: asc
          ) {
            periodStartTimestamp
            longNotional
            shortNotional
            market
          }
        }
      `)

      return graphClient.request(query, {
        market,
        from: from.toString(),
        to: to.toString(),
      })
    },
  })
}

export const useMarket7dData = (asset: SupportedAsset) => {
  const chainId = useChainId()
  const graphClient = useGraphClient()
  const market = ChainMarkets2[chainId][asset]

  return useQuery({
    queryKey: ['market7dData', chainId, asset],
    enabled: !!market,
    queryFn: async () => {
      if (!market) return

      const { to, from } = last7dBounds()

      const query = gql(`
        query Market7DayVolume($market: Bytes!, $from: BigInt!, $to: BigInt!) {
          volume: bucketedVolumes(
            where:{bucket: daily, market: $market, periodStartTimestamp_gte: $from, periodStartTimestamp_lte: $to}
            orderBy: periodStartTimestamp, orderDirection: asc
          ) {
            market
            longNotional
            shortNotional
          }

          hourlyFunding: bucketedVolumes(
            where: {bucket: hourly, market: $market, periodStartTimestamp_gte: $from, periodStartTimestamp_lte: $to}
            orderBy: periodStartTimestamp, orderDirection: asc
          ) {
            market
            weightedLongFunding
            weightedLongInterest
            weightedMakerFunding
            weightedMakerInterest
            totalWeight
            periodStartTimestamp
            periodEndTimestamp
          }

          firstNonZeroFunding: bucketedVolumes(
            where: {
              and: [
                {bucket: hourly, market: $market, periodStartTimestamp_lt: $from },
                {or: [
                  {weightedLongFunding_gt: 0 },
                  {weightedLongInterest_gt: 0 },
                ]}
              ]
            }
            orderBy: periodStartTimestamp, orderDirection: desc, first: 1
          ) {
            market
            weightedLongFunding
            weightedLongInterest
            weightedMakerFunding
            weightedMakerInterest
            totalWeight
            periodStartTimestamp
            periodEndTimestamp
          }

          currentAccumulator: marketAccumulators(
            where: { market: $market, latest: true }
          ) {
            market, fundingMaker, interestMaker, positionFeeMaker
          }

          startAccumulator: marketAccumulators(
            where: { market: $market, version_gte: $from }, first: 1, orderBy: version, orderDirection: asc
          ) {
            market, fundingMaker, interestMaker, positionFeeMaker, version
          }
        }
      `)

      const { volume, hourlyFunding, firstNonZeroFunding, currentAccumulator, startAccumulator } =
        await graphClient.request(query, {
          market: market,
          from: from.toString(),
          to: to.toString(),
        })

      const takerVolumes = {
        long: sum(volume.map((v) => BigInt(v.longNotional))),
        short: sum(volume.map((v) => BigInt(v.shortNotional))),
      }

      const fundingRates = hourlyFunding
        .map((f, i) => {
          let [takerTotal, makerTotal, totalWeight] = [
            BigOrZero(f?.weightedLongFunding) + BigOrZero(f?.weightedLongInterest),
            BigOrZero(f?.weightedMakerFunding) + BigOrZero(f?.weightedMakerInterest),
            BigOrZero(f?.totalWeight),
          ]

          // Set the initial rate to the first non-zero funding rate if the first bucket is zero
          if (i === 0 && takerTotal === 0n) {
            takerTotal =
              BigOrZero(firstNonZeroFunding.at(0)?.weightedLongFunding) +
              BigOrZero(firstNonZeroFunding.at(0)?.weightedLongInterest)
            totalWeight = BigOrZero(firstNonZeroFunding.at(0)?.totalWeight)
          }
          if (i === 0 && makerTotal === 0n) {
            makerTotal =
              BigOrZero(firstNonZeroFunding.at(0)?.weightedMakerFunding) +
              BigOrZero(firstNonZeroFunding.at(0)?.weightedMakerInterest)
          }

          const scaleFactor =
            totalWeight !== 0n ? Big6Math.fromFloatString((Number(Hour) / Number(totalWeight)).toString()) : 0n
          const takerUnscaledRate = totalWeight !== 0n ? takerTotal / totalWeight : 0n
          const makerUnscaledRate = totalWeight !== 0n ? makerTotal / totalWeight : 0n
          const takerHrRate = takerUnscaledRate * scaleFactor
          const makerHrRate = makerUnscaledRate * scaleFactor
          return { timestamp: BigInt(f.periodStartTimestamp), takerHrRate, makerHrRate }
        })
        .filter(notEmpty)

      // Scale accumulation values to fill the 7d window
      const accumulatorScaleFactor = Big6Math.fromFloatString(
        (Number(7n * Day) / Number(to - Number(startAccumulator.at(0)?.version ?? from))).toString(),
      )
      return {
        takerVolumes,
        fundingRates,
        // Accumulations are the delta between now and start, scaled to fill the 7d window
        makerAccumulation: {
          funding: Big6Math.mul(
            BigOrZero(currentAccumulator[0]?.fundingMaker) - BigOrZero(startAccumulator[0]?.fundingMaker),
            accumulatorScaleFactor,
          ),
          interest: Big6Math.mul(
            BigOrZero(currentAccumulator[0]?.interestMaker) - BigOrZero(startAccumulator[0]?.interestMaker),
            accumulatorScaleFactor,
          ),
          positionFee: Big6Math.mul(
            BigOrZero(currentAccumulator[0]?.positionFeeMaker) - BigOrZero(startAccumulator[0]?.positionFeeMaker),
            accumulatorScaleFactor,
          ),
        },
      }
    },
  })
}

export const useAccountARBSeasonData = (season: STIPSeasonNumber) => {
  const chainId = useChainId()
  const graphClient = useGraphClient()
  const { address } = useAddress()

  return useQuery({
    queryKey: ['accountARBSeasonData', chainId, address, season],
    enabled: !!address,
    queryFn: async () => {
      if (!address) return

      const markets = chainAssetsWithAddress(chainId)
      const { from, to, fromBlock } = STIPDropParams[season]
      const query = gql(`
        query AccountARBSeasonData($account: Bytes!, $from: BigInt!, $to: BigInt!, $fromBlock: Int!, $first: Int!, $skip: Int!) {
          start: marketAccountPositions(
            where: { account: $account }
            block: { number: $fromBlock }
          ) {
            pendingLong, pendingShort, market
          }

          updates: updateds(
            where: { account: $account, blockTimestamp_gte: $from, blockTimestamp_lt: $to }
            first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: asc
          ) {
            newLong, newShort, market, price, latestPrice, positionFee, blockNumber, version
          }

          riskParameterUpdateds(orderBy: blockNumber, orderDirection: desc) {
            market, newRiskParameter_takerFee, blockNumber
          }
        }
      `)

      const { start, updates, riskParameterUpdateds } = await queryAll(async (pageNumber: number) =>
        graphClient.request(query, {
          account: address,
          from: timeToSeconds(from).toString(),
          to: timeToSeconds(to).toString(),
          fromBlock: fromBlock,
          first: GraphDefaultPageSize,
          skip: pageNumber * GraphDefaultPageSize,
        }),
      )

      const currentPositions = markets.reduce((acc, { marketAddress }) => {
        const pos = start.find((p) => getAddress(p.market) === marketAddress)
        return { ...acc, [marketAddress]: Big6Math.max(BigOrZero(pos?.pendingLong), BigOrZero(pos?.pendingShort)) }
      }, {} as Record<Address, bigint>)

      return updates.reduce(
        (acc, update) => {
          const updateMarket = getAddress(update.market)

          // Delta is the absolute value of the difference between the current position and the new position
          const delta = Big6Math.abs(currentPositions[updateMarket] - magnitude(0n, update.newLong, update.newShort))
          const feeNotional = calcNotional(delta, BigInt(update.latestPrice))
          const volNotional = calcNotional(
            delta,
            BigInt(update.price) === 0n ? BigInt(update.latestPrice) : BigInt(update.price),
          )

          // Find risk parameter for this market that is earlier or on the same block as the update
          const riskParameter = riskParameterUpdateds.find(
            (rp) => getAddress(rp.market) === updateMarket && rp.blockNumber <= update.blockNumber,
          )

          // Rebate is min(notional * takerFee, positionFeePaid) * rebatePct
          const feeRebate = calcSTIPFeeRebate({
            takerNotional: feeNotional,
            takerFeeBps: BigOrZero(riskParameter?.newRiskParameter_takerFee),
            positionFee: BigInt(update.positionFee),
            season,
          })
          currentPositions[updateMarket] = magnitude(0n, update.newLong, update.newShort)

          return {
            volume: acc.volume + volNotional,
            fees: acc.fees + feeRebate,
          }
        },
        { volume: 0n, fees: 0n },
      )
    },
  })
}

export const getPriceAtVersion = async ({
  graphClient,
  market,
  version,
}: {
  graphClient: GraphQLClient
  market: Address
  version: bigint
}) => {
  const query = gql(`
    query PriceAtVersion($versionId: ID!) {
      marketVersionPrice(id: $versionId) { price }
    }
  `)

  const res = await graphClient.request(query, {
    versionId: `${market}:${version.toString()}`.toLowerCase(),
  })

  return res.marketVersionPrice?.price ?? 0n
}
