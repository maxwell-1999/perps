import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { AlchemyProvider, JsonRpcProvider } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { useNetwork } from 'wagmi'
import { baseGoerli } from 'wagmi/chains'

import { AlchemyActiveKey, DefaultChain, GraphUrls, SupportedChainId, isSupportedChain } from '@/constants/network'

export const useChainId = () => {
  let { chain } = useNetwork()
  chain = chain ?? DefaultChain

  if (chain === undefined || !isSupportedChain(chain)) throw new Error('Invalid chain')

  return chain.id as SupportedChainId
}

const providers = new Map<SupportedChainId, AlchemyProvider | JsonRpcProvider>()
export const useProvider = () => {
  const chainId = useChainId()

  if (!providers.has(chainId)) {
    providers.set(
      chainId,
      chainId === baseGoerli.id
        ? new JsonRpcProvider('https://goerli.base.org')
        : new AlchemyProvider(chainId, AlchemyActiveKey),
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return providers.get(chainId)!
}

const graphClients = new Map<SupportedChainId, GraphQLClient>()
export const useGraphClient = () => {
  const chainId = useChainId()

  if (!graphClients.has(chainId)) graphClients.set(chainId, new GraphQLClient(GraphUrls[chainId]))

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return graphClients.get(chainId)!
}

const pythClient = new EvmPriceServiceConnection('https://xc-mainnet.pyth.network')
export const usePyth = () => {
  return pythClient
}
