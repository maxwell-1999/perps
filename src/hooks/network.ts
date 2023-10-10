import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { WebSocketProvider } from 'ethers'
import EventEmitter from 'events'
import { GraphQLClient } from 'graphql-request'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PublicClient, createPublicClient, getAddress, webSocket } from 'viem'
// eslint-disable-next-line no-restricted-imports
import { useNetwork, usePublicClient, useAccount as useWagmiAccount } from 'wagmi'

import {
  GraphUrls,
  GraphUrls2,
  PythMainnetUrl,
  PythTestnetUrl,
  SupportedChainId,
  isSupportedChain,
  isTestnet,
} from '@/constants/network'
import { useDefaultChain } from '@/contexts/chainContext'

export const useAddress = () => {
  const { address: wagmiAddress } = useWagmiAccount()
  const [addressInfo, setAddressInfo] = useState<{ address: `0x${string}` | undefined; overriding: boolean }>({
    address: undefined,
    overriding: false,
  })
  const { query, isReady } = useRouter()
  useEffect(() => {
    if (!isReady) return
    const addressOverride = query.a
      ? Array.isArray(query.a)
        ? getAddress(query.a[0])
        : getAddress(query.a)
      : undefined
    setAddressInfo({ address: addressOverride ?? wagmiAddress, overriding: !!addressOverride })
  }, [isReady, query.a, wagmiAddress])

  return addressInfo
}

export const useChainId = () => {
  let { chain } = useNetwork()
  const { defaultChain } = useDefaultChain()
  chain = chain ?? defaultChain

  if (chain === undefined || !isSupportedChain(chain.id)) return defaultChain.id

  return chain.id as SupportedChainId
}

const wsProviders = new Map<SupportedChainId, WebSocketProvider>()
export const useWsProvider = () => {
  const chainId = useChainId()
  const providerUrl = useRPCProviderUrl()

  if (!wsProviders.has(chainId)) {
    wsProviders.set(chainId, new WebSocketProvider(providerUrl.replace('https://', 'wss://')))
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return wsProviders.get(chainId)!
}

const viemWsClients = new Map<SupportedChainId, PublicClient>()
// We need to create a WS public client directly instead of using Wagmi's hooks because the wagmi hook
// returns a Fallback provider which does not support eth_subscribe
export const useViemWsClient = () => {
  const chainId = useChainId()
  const providerUrl = useRPCProviderUrl()

  if (!viemWsClients.has(chainId)) {
    viemWsClients.set(chainId, createPublicClient({ transport: webSocket(providerUrl.replace('https://', 'wss://')) }))
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return viemWsClients.get(chainId)!
}

export const useRPCProviderUrl = (): string => {
  const chainId = useChainId()
  const { transport } = usePublicClient({ chainId })

  return transport.transports[0].value.url // Taken from https://wagmi.sh/core/ethers-adapters
}

const graphClients = new Map<SupportedChainId, GraphQLClient>()
export const useGraphClient = () => {
  const chainId = useChainId()

  if (!graphClients.has(chainId)) graphClients.set(chainId, new GraphQLClient(GraphUrls[chainId]))

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return graphClients.get(chainId)!
}

const graphClients2 = new Map<SupportedChainId, GraphQLClient>()
export const useGraphClient2 = () => {
  const chainId = useChainId()

  if (!graphClients2.has(chainId)) graphClients2.set(chainId, new GraphQLClient(GraphUrls2[chainId]))

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return graphClients2.get(chainId)!
}

const pythClients = {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  mainnet: new EvmPriceServiceConnection(PythMainnetUrl!, { timeout: 10000, priceFeedRequestConfig: { binary: true } }),
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  testnet: new EvmPriceServiceConnection(PythTestnetUrl!, { timeout: 10000, priceFeedRequestConfig: { binary: true } }),
}

export const usePyth = () => {
  const chainId = useChainId()
  return isTestnet(chainId) ? pythClients.testnet : pythClients.mainnet
}

const pythSubscriptions = new Map<string, EventEmitter>()
export const usePythSubscription = (feedIds: string[]) => {
  const pyth = usePyth()
  const key = feedIds.sort().join(',')
  if (!pythSubscriptions.has(key)) {
    const emitter = new EventEmitter()
    pyth.subscribePriceFeedUpdates(feedIds, (updates) => {
      emitter.emit('updates', updates)
    })
    pythSubscriptions.set(key, emitter)
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return pythSubscriptions.get(key)!
}
