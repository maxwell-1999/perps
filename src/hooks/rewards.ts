import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { Address, Hex, getAddress, zeroAddress } from 'viem'
import { useNetwork, useWalletClient } from 'wagmi'
import { waitForTransaction } from 'wagmi/actions'

import { GuildAccessEndpoint, PowerUserRoleId } from '@/components/pages/Rewards/constants'
import { useRewardsCopy } from '@/components/pages/Rewards/hooks'
import { useTransactionToasts, useTxToastCopy } from '@/components/shared/Toast/transactionToasts'
import { metamaskTxRejectedError } from '@/constants/network'
import { FinishedSTIPSeasons, STIPDropParams, STIPSeasonNumber } from '@/constants/stipDrop'

import { useSeasonalMerkleClaim } from './contracts'
import { useAddress, useChainId } from './network'

type RewardDataJSON = {
  userRewards: Record<
    string,
    | {
        taker: string
        maker: string
        fee: string
        vault: string
        total: string
      }
    | undefined
  >
  tree: ReturnType<StandardMerkleTree<['address', 'uint256']>['dump']>
}
export const useRewardData = () => {
  const chainId = useChainId()
  const { address } = useAddress()
  const seasonMerkleClaim = useSeasonalMerkleClaim()

  return useQueries({
    queries: FinishedSTIPSeasons.map((season) => {
      const blobUrl = STIPDropParams[season].blobUrl
      return {
        queryKey: ['RewardData', season, address, chainId],
        enabled: !!address && !!blobUrl,
        queryFn: async () => {
          if (!address || !blobUrl) return undefined

          const response = await fetch(blobUrl)
          const data = (await response.json()) as RewardDataJSON
          const tree = StandardMerkleTree.load(data.tree)
          // Find proof in tree
          let proof: Hex[] = []
          let claimAmount = 0n
          for (const [i, v] of tree.entries()) {
            if (getAddress(v[0]) === address) {
              // (3)
              proof = tree.getProof(i) as Hex[]
              claimAmount = BigInt(v[1])
            }
          }
          const root = tree.root as Hex
          const claimed = await seasonMerkleClaim.read.claimed([address, root])

          return {
            season,
            userRewards: {
              taker: BigInt(data.userRewards[address]?.taker ?? 0n),
              maker: BigInt(data.userRewards[address]?.maker ?? 0n),
              fee: BigInt(data.userRewards[address]?.fee ?? 0n),
              vault: BigInt(data.userRewards[address]?.vault ?? 0n),
            },
            proof: proof,
            amount: claimAmount,
            root,
            claimed,
          }
        },
      }
    }),
  })
}

export const useClaimRewards = () => {
  const { data: walletClient } = useWalletClient()
  const { address } = useAddress()
  const { chain } = useNetwork()
  const chainId = useChainId()
  const merkleClaim = useSeasonalMerkleClaim(walletClient ?? undefined)
  const queryClient = useQueryClient()

  const errorToastCopy = useTxToastCopy()
  const copy = useRewardsCopy()
  const { triggerErrorToast } = useTransactionToasts()
  const addRecentTransaction = useAddRecentTransaction()

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) => ['RewardData'].includes(queryKey[0] as string) && queryKey.includes(chainId),
    })
  }, [queryClient, chainId])

  const claimRewards = async ({ root, amount, proof }: { root: Hex; amount: bigint; proof: Hex[] }) => {
    if (!walletClient || !address) return
    try {
      const hash = await merkleClaim.write.claim([[amount], [root], [proof]], {
        chain,
        chainId,
        account: address || zeroAddress,
      })
      await waitForTransaction({ hash })
      await refresh()
      addRecentTransaction({
        hash,
        description: copy.claimedRewards,
      })
    } catch (err: any) {
      // Ignore metamask tx rejected error
      if (err.details !== metamaskTxRejectedError) {
        triggerErrorToast({ title: errorToastCopy.error, message: errorToastCopy.errorClaimingRewards })
      }

      console.error(err)
    }
  }

  return { claimRewards }
}

type Role = { roleId: number; access: boolean }
export const useCheckGuildAccess = () => {
  const { address } = useAddress()
  return useQuery({
    queryKey: ['guildAccess', address],
    enabled: !!address,
    queryFn: async () => {
      try {
        const accessData = await fetch(`${GuildAccessEndpoint}/${address}`)
        const roles: Role[] = await accessData.json()
        const powerUser = roles.find((role) => role.roleId === PowerUserRoleId)
        if (!powerUser) {
          return false
        }
        return powerUser.access
      } catch (err) {
        return false
      }
    },
  })
}

export type LeaderboardEntry = {
  account: string
  amount: string
  rank: number
}

export const usePnlLeaderboardData = ({
  address = getAddress(zeroAddress),
  season,
  page = 0,
  enabled = true,
}: {
  address?: Address | string
  season: STIPSeasonNumber
  page?: number
  enabled?: boolean
}) => {
  return useQuery({
    queryKey: ['leaderboard-pnl', season, address, page],
    enabled,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/leaderboard?board=s${season}-pnl&account=${address}&page=${page}`)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json() as Promise<{
          account?: LeaderboardEntry
          leaderboard: LeaderboardEntry[]
          page: number
          pageSize: number
          totalAccounts: number
          updatedAt: Date
        }>
      } catch (error) {
        console.error('There was an error!', error)
      }
    },
  })
}

export type PnlLeaderboardData = Awaited<ReturnType<typeof usePnlLeaderboardData>>['data']

export const useVolumeLeaderboardData = ({
  address = getAddress(zeroAddress),
  season,
  page = 0,
  enabled = true,
}: {
  address?: Address | string
  season: STIPSeasonNumber
  page?: number
  enabled?: boolean
}) => {
  return useQuery({
    queryKey: ['leaderboard-volume', season, address, page],
    enabled,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/leaderboard?board=s${season}-volume&account=${address}&page=${page}`)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json() as Promise<{
          account?: LeaderboardEntry
          leaderboard: LeaderboardEntry[]
          page: number
          pageSize: number
          totalAccounts: number
          updatedAt: Date
        }>
      } catch (error) {
        console.error('There was an error!', error)
      }
    },
  })
}

export type VolumeLeaderboardData = Awaited<ReturnType<typeof useVolumeLeaderboardData>>['data']
