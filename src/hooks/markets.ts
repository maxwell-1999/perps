import { useQuery } from '@tanstack/react-query'
import { GraphQLClient } from 'graphql-request'
import { Address, getAddress, numberToHex } from 'viem'
import { useAccount } from 'wagmi'

import { SupportedAsset } from '@/constants/assets'
import { ChainMarkets } from '@/constants/markets'
import { notEmpty, sum, unique } from '@/utils/arrayUtils'
import { Big18Math } from '@/utils/big18Utils'
import { GraphDefaultPageSize, queryAll } from '@/utils/graphUtils'
import { calcLiquidationPrice, next, size } from '@/utils/positionUtils'
import { last24hrBounds } from '@/utils/timeUtils'

import { IPerennialLens, LensAbi } from '@t/generated/LensAbi'
import { gql } from '@t/gql'
import { GetAccountPositionsQuery } from '@t/gql/graphql'

import { useLens } from './contracts'
import { useChainId, useGraphClient } from './network'

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
      `)

      return graphClient.request(query, {
        products: [market.long, market.short].filter(notEmpty),
        long: market.long ?? market.short,
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
              address,
              lens,
              graphClient,
              accountSnapshots.find((s) => getAddress(s.productAddress) === market.long),
              positions.positions.find((p) => getAddress(p.product) === market.long),
              productSnapshots[asset]?.long,
            ),
            short: await fetchUserPositionDetails(
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

// Pulls all data required to calculate metrics across a user's current position
const fetchUserPositionDetails = async (
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
      $taker: Boolean!,
      $first: Int!,
      $skip: Int!
    ) {
      takeOpeneds(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
      }, first: $first, skip: $skip, orderBy: blockNumber, orderDirection: asc) {
        version
        amount
        blockNumber
      }
      takeCloseds(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
      }, first: $first, skip: $skip, orderBy: blockNumber, orderDirection: asc) {
        version
        amount
        blockNumber
      }
      makeOpeneds(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
      }, first: $first, skip: $skip, orderBy: blockNumber, orderDirection: asc) {
        version
        amount
        blockNumber
      }
      makeCloseds(where:{
        account: $account,
        product: $product,
        blockNumber_gte: $startBlock,
      }, first: $first, skip: $skip, orderBy: blockNumber, orderDirection: asc) {
        version
        amount
        blockNumber
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
  const latestVersion = productSnapshot.latestVersion
  const settleVersions = unique(changesMerged.map((c) => BigInt(c.version))).map((v) =>
    v === latestVersion.version ? v : v + 1n,
  )

  // Get all prices at the settle versions
  const atVersions = (await lens.atVersions.staticCall(productAddress, settleVersions)).reduce(
    (acc, v) => ({ ...acc, [v.version.toString()]: Big18Math.abs(v.price) }),
    {} as { [key: string]: bigint },
  )

  // Create a separate sub position for each position change to calculate the average entry price
  let currentPosition = 0n
  const subPositions = changesMerged.map((change) => {
    const { version, amount } = change
    // Use settle version if available, otherwise use current version
    const price = atVersions[(BigInt(version) + 1n).toString()] ?? atVersions[version]
    currentPosition = BigInt(amount) + currentPosition

    return { price, size: currentPosition }
  })

  // Average Entry = Total Notional / Total Size
  const averageEntry = Big18Math.div(
    sum(subPositions.map((p) => Big18Math.mul(p.price, p.size))),
    sum(subPositions.map((p) => p.size)),
  )

  // Collateral at one block before the position was opened
  const startCollateral = await lens['collateral(address,address)'].staticCall(address, productAddress, {
    blockTag: numberToHex(Number(startBlock) - 1),
  })
  const initialDepositits =
    sum(positionChanges.initialDeposits.map((d) => BigInt(d.amount))) -
    sum(positionChanges.initialWithdrawals.map((d) => BigInt(d.amount)))

  return {
    side,
    position: position[side],
    nextPosition: next(pre, position)[side],
    startCollateral: startCollateral + initialDepositits,
    currentCollateral: collateral,
    deposits: BigInt(depositAmount),
    averageEntry,
    liquidationPrice: calcLiquidationPrice(productSnapshot, next(pre, position), collateral),
    notional: size(openInterest),
    nextNotional: Big18Math.abs(Big18Math.mul(size(next(pre, position)), productSnapshot.latestVersion.price)),
    leverage: Big18Math.div(size(openInterest), collateral),
    fees,
  }
}
