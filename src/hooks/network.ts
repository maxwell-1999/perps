import { AlchemyProvider, JsonRpcProvider } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { useMemo } from 'react'
import { useNetwork, usePublicClient } from 'wagmi'
import { baseGoerli } from 'wagmi/chains'

import { AlchemyActiveKey, DefaultChain, GraphUrls, SupportedChainId, isSupportedChain } from '@/constants/network'

export const useChainId = () => {
  let { chain } = useNetwork()
  chain = chain ?? DefaultChain

  if (chain === undefined || !isSupportedChain(chain)) throw new Error('Invalid chain')

  return chain.id as SupportedChainId
}

export const useProvider = () => {
  const publicClient = usePublicClient()

  return useMemo(
    () =>
      publicClient.chain.id === baseGoerli.id
        ? new JsonRpcProvider('https://goerli.base.org')
        : new AlchemyProvider(publicClient.chain.id, AlchemyActiveKey),
    [publicClient.chain.id],
  )
}

export const useGraphClient = () => {
  const chainId = useChainId()

  return useMemo(() => new GraphQLClient(GraphUrls[chainId]), [chainId])
}
