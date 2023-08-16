import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { WebSocketProvider } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getAddress } from 'viem'
// eslint-disable-next-line no-restricted-imports
import { useNetwork, usePublicClient, useAccount as useWagmiAccount } from 'wagmi'

import { GraphUrls, SupportedChainId, isSupportedChain } from '@/constants/network'
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
