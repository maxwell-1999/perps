import { useQueries } from '@tanstack/react-query'
import { getAddress } from 'viem'
import { useBlockNumber } from 'wagmi'

import { chainVaultsWithAddress } from '@/constants/vaults'
import { AccumulatorType, AccumulatorTypes } from '@/utils/accumulatorUtils'
import { Big6Math, BigOrZero } from '@/utils/big6Utils'
import { last7dBounds } from '@/utils/timeUtils'

import { gql } from '@t/gql'

import { useChainId, useGraphClient2 } from '../network'
import { useVaultSnapshots2 } from './chain'

export type VaultAccumulations = NonNullable<Awaited<ReturnType<typeof useVaults7dAccumulations>>[number]['data']>
export const useVaults7dAccumulations = () => {
  const chainId = useChainId()
  const { data: vaultSnapshots, isLoading: vaultSnapshotsLoading } = useVaultSnapshots2()
  const graphClient = useGraphClient2()
  const vaults = chainVaultsWithAddress(chainId)
  const { data: blockNumber } = useBlockNumber()

  return useQueries({
    queries: vaults.map((vault) => {
      return {
        queryKey: ['vaults7dAccumulations', chainId, vault.vaultAddress],
        enabled: !vaultSnapshotsLoading && !!vaultSnapshots?.vault[vault.vault] && !!blockNumber,
        queryFn: async () => {
          if (!vaultSnapshots?.vault[vault.vault] || !blockNumber) return
          const vaultSnapshot = vaultSnapshots?.vault[vault.vault]
          const { from, to } = last7dBounds()
          const startVersionQuery = gql(`
            query UpdatedNearestTimestamp($market: Bytes!, $account: Bytes!, $timestamp: BigInt!) {
              updateds(
                where: { market: $market, account: $account, version_gte: $timestamp }
                first: 1, orderBy: version, orderDirection: asc
              ) { version, market, blockNumber }
            }
          `)

          const startBlockNumbers = await Promise.all(
            vaultSnapshot.registrations.map(async (registration) => {
              const result = await graphClient.request(startVersionQuery, {
                market: registration.market,
                account: vault.vaultAddress,
                timestamp: from.toString(),
              })

              return {
                market: registration.market,
                // If there are no update events, use the latest blocknumber with an offset to accounting for indexing delay
                blockNumber: BigOrZero(result.updateds[0]?.blockNumber ?? blockNumber - 100n),
              }
            }),
          )

          const accountPositionQuery = gql(`
            query VaultAccountPosition($market: Bytes!, $account: Bytes!, $blockNumber: Int!) {
              start: marketAccountPositions(
                where: { market: $market, account: $account }
                block: { number: $blockNumber }
              ) {
                market, lastUpdatedVersion, lastUpdatedBlockNumber
                maker, openNotional, openSize
                accumulatedValue, accumulatedKeeperFees, accumulatedPositionFees, accumulatedMakerPositionFee
                netDeposits, accumulatedPnl, accumulatedFunding, accumulatedInterest, collateral
                weightedFunding, weightedInterest, weightedMakerPositionFees, totalWeight
              }

              now: marketAccountPositions(where: { market: $market, account: $account }) {
                market, lastUpdatedVersion, lastUpdatedBlockNumber
                maker, openNotional, openSize
                accumulatedValue, accumulatedKeeperFees, accumulatedPositionFees, accumulatedMakerPositionFee
                netDeposits, accumulatedPnl, accumulatedFunding, accumulatedInterest, collateral
                weightedFunding, weightedInterest, weightedMakerPositionFees, totalWeight
              }
            }
          `)

          const accountPositions = await Promise.all(
            startBlockNumbers.map(async ({ market, blockNumber }) =>
              graphClient.request(accountPositionQuery, {
                market: market,
                account: vault.vaultAddress,
                blockNumber: Number(blockNumber),
              }),
            ),
          )

          return {
            vaultAddress: vault.vaultAddress,
            marketValues: accountPositions.map((accountPosition) => {
              const now = accountPosition.now.at(0)
              const start = accountPosition.start.at(0)
              const totalWeight = BigOrZero(now?.totalWeight) - BigOrZero(start?.totalWeight)
              const weightedAverageFundingInterest =
                totalWeight > 0n
                  ? Big6Math.div(
                      BigOrZero(now?.weightedFunding) -
                        BigOrZero(start?.weightedFunding) +
                        BigOrZero(now?.weightedInterest) -
                        BigOrZero(start?.weightedInterest),
                      totalWeight,
                    )
                  : 0n
              const weightedAverageMakerPositionFees =
                totalWeight > 0n
                  ? Big6Math.div(
                      BigOrZero(now?.weightedMakerPositionFees) - BigOrZero(start?.weightedMakerPositionFees),
                      totalWeight,
                    )
                  : 0n

              // Since the accumulation values might not align with the 7d bounds, we find the ratio between
              // the desired window and the accumulated values window. If the desired window is larger than the
              // accumulation window, then the weighted average is increased, if the desired window is smaller
              // than the accumulation period, then the weighted average is decreased
              const windowAlignmentFactor =
                totalWeight > 0n
                  ? (to - from) / (Number(now?.lastUpdatedVersion ?? to) - Number(start?.lastUpdatedVersion ?? from))
                  : 0
              return {
                market: getAddress(accountPosition.now[0].market),
                weightedAverageFundingInterest: Big6Math.div(
                  Big6Math.mul(
                    weightedAverageFundingInterest,
                    Big6Math.fromFloatString(windowAlignmentFactor.toString()),
                  ),
                  Big6Math.ONE,
                ),
                weightedAverageMakerPositionFees: Big6Math.div(
                  Big6Math.mul(
                    weightedAverageMakerPositionFees,
                    Big6Math.fromFloatString(windowAlignmentFactor.toString()),
                  ),
                  Big6Math.ONE,
                ),
                accumulated: AccumulatorTypes.map((accumulatorType) => ({
                  [accumulatorType.type]:
                    BigOrZero(accountPosition.now.at(0)?.[accumulatorType.realizedKey]) -
                    BigOrZero(accountPosition.start.at(0)?.[accumulatorType.realizedKey]),
                })).reduce((acc, curr) => {
                  return { ...acc, ...curr }
                }, {} as Record<AccumulatorType, bigint>),
              }
            }),
          }
        },
      }
    }),
  })
}
