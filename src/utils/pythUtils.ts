import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { Address, Hex } from 'viem'

import { SupportedChainId } from '@/constants/network'

import { getPythProviderContract } from './contractUtils'
import { nowSeconds } from './timeUtils'

export const getRecentVaa = async ({
  pyth,
  feeds,
}: {
  pyth: EvmPriceServiceConnection
  feeds: { providerId: string; minValidTime: bigint }[]
}) => {
  const priceFeeds = await pyth.getLatestPriceFeeds(feeds.map(({ providerId }) => providerId))
  if (!priceFeeds) throw new Error('No price feeds found')

  return priceFeeds.map((priceFeed) => {
    const vaa = priceFeed.getVAA()
    if (!vaa) throw new Error('No VAA found')

    const publishTime = priceFeed.getPriceUnchecked().publishTime
    const minValidTime = feeds.find(({ providerId }) => `0x${providerId}` === priceFeed.id)?.minValidTime

    return {
      feedId: priceFeed.id,
      vaa: `0x${Buffer.from(vaa, 'base64').toString('hex')}`,
      publishTime,
      version: BigInt(publishTime) - (minValidTime ?? 4n),
    }
  })
}

const getVaaForPublishTime = async ({
  pyth,
  feed,
  requestedPublishTime,
}: {
  pyth: EvmPriceServiceConnection
  requestedPublishTime: bigint
  feed: { providerId: string; minValidTime: bigint }
}) => {
  const [vaa, publishTime] = await pyth.getVaa(feed.providerId, Number(requestedPublishTime))
  if (!vaa) throw new Error('No VAA found')

  return {
    feedId: feed.providerId,
    vaa: `0x${Buffer.from(vaa, 'base64').toString('hex')}`,
    publishTime,
    version: BigInt(publishTime) - feed.minValidTime,
  }
}

export const buildCommitmentsForOracles = async ({
  chainId,
  pyth,
  marketOracles,
  onError,
}: {
  chainId: SupportedChainId
  pyth: EvmPriceServiceConnection
  marketOracles: { providerAddress: Address; providerId: Hex; minValidTime: bigint }[]
  onError?: () => void
}) => {
  try {
    const now = BigInt(nowSeconds())
    const feedIds = marketOracles.map(({ providerId, minValidTime }) => ({
      providerId,
      minValidTime,
    }))
    // Get current VAAs for each price feed
    const priceFeedUpdateData = await getRecentVaa({ feeds: feedIds, pyth })

    return Promise.all(
      Object.values(marketOracles).map(async ({ providerAddress, providerId, minValidTime }) => {
        const contract = getPythProviderContract(providerAddress, chainId)
        let updateData = priceFeedUpdateData.find(({ feedId }) => `0x${feedId}` === providerId)
        if (!updateData) throw new Error('No update data found')

        const [nextRequestedVersion, nextVersionIndexToCommit, versionListLength, gracePeriod] = await Promise.all([
          contract.read.nextVersionToCommit(),
          contract.read.nextVersionIndexToCommit(),
          contract.read.versionListLength(),
          contract.read.GRACE_PERIOD(),
        ])
        let indexToCommit = nextVersionIndexToCommit
        let version = nextRequestedVersion
        let withinGracePeriod = version > 0n ? now - version < gracePeriod : true

        // Scan forward through the version list until we find a version that is within it's grace period
        // or we reach the end of the list
        while (!withinGracePeriod && indexToCommit < versionListLength) {
          indexToCommit = indexToCommit + 1n
          version = indexToCommit < versionListLength ? await contract.read.versionList([indexToCommit]) : 0n
          withinGracePeriod = version > 0n ? now - version < gracePeriod : true
        }

        // If version is non-zero and before existing update publish time
        // find a VAA with a publish time before version
        if (version > 0n && version < updateData.publishTime) {
          updateData = await getVaaForPublishTime({
            pyth,
            feed: { providerId, minValidTime },
            requestedPublishTime: version - minValidTime,
          })
        }

        return {
          pyth: providerAddress,
          version: updateData.version,
          value: 1n,
          index: indexToCommit,
          updateData: updateData.vaa as Hex,
        }
      }),
    )
  } catch (err: any) {
    if (onError) {
      onError()
    }
    throw err
  }
}
