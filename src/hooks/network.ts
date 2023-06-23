import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { WebSocketProvider } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { useRouter } from 'next/router'
import { getAddress } from 'viem'
// eslint-disable-next-line no-restricted-imports
import { useNetwork, usePublicClient, useAccount as useWagmiAccount } from 'wagmi'

import { DefaultChain, GraphUrls, SupportedChainId, isSupportedChain } from '@/constants/network'

export const useAddress = () => {
  const { address: wagmiAddress } = useWagmiAccount()
  const { query } = useRouter()
  const addressOverride = query.a ? (Array.isArray(query.a) ? getAddress(query.a[0]) : getAddress(query.a)) : undefined

  return { address: addressOverride ?? wagmiAddress, overriding: !!addressOverride }
}

export const useChainId = () => {
  let { chain } = useNetwork()
  chain = chain ?? DefaultChain

  if (chain === undefined || !isSupportedChain(chain.id)) return DefaultChain.id

  return chain.id as SupportedChainId
}

const wsProviders = new Map<SupportedChainId, WebSocketProvider>()
export const useWsProvider = () => {
  const chainId = useChainId()
  const { transport } = usePublicClient({ chainId })

  if (!wsProviders.has(chainId)) {
    const providerUrl = transport.transports[0].value.url // Taken from https://wagmi.sh/core/ethers-adapters
    wsProviders.set(chainId, new WebSocketProvider(providerUrl.replace('https://', 'wss://')))
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return wsProviders.get(chainId)!
}

const graphClients = new Map<SupportedChainId, GraphQLClient>()
export const useGraphClient = () => {
  const chainId = useChainId()

  if (!graphClients.has(chainId)) graphClients.set(chainId, new GraphQLClient(GraphUrls[chainId]))

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return graphClients.get(chainId)!
}

const pythClient = new EvmPriceServiceConnection('https://xc-mainnet.pyth.network')
export const usePyth = () => pythClient
