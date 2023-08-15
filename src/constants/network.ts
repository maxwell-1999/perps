import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { arbitrum, arbitrumGoerli, baseGoerli, goerli, mainnet } from '@wagmi/chains'
import { configureChains, createConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'

import { LocalDev } from './auth'

export const AlchemyProdKeys = process.env.NEXT_PUBLIC_ALCHEMY_PROD_KEYS?.split(',').map((k) => k.trim())
export const QuickNodeBaseGoerliUrl = process.env.NEXT_PUBLIC_QUICKNODE_URL_BASE_GOERLI
export const WalletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!AlchemyProdKeys || !AlchemyProdKeys.length) throw new Error('Missing alchemy key configuration')
if (!WalletConnectProjectId) throw new Error('Missing walletconnect project id')

// Random select a key from available keys
export const AlchemyActiveKey = AlchemyProdKeys[Math.floor(Math.random() * AlchemyProdKeys.length)]
export const SupportedChainIds = [arbitrum.id, mainnet.id, arbitrumGoerli.id, goerli.id, baseGoerli.id] as const
export type SupportedChainId = (typeof SupportedChainIds)[number]
export const isSupportedChain = (chainId?: number) =>
  chainId !== undefined && SupportedChainIds.includes(chainId as SupportedChainId)
export const isTestnet = (chainId?: number) =>
  chainId === goerli.id || chainId === arbitrumGoerli.id || chainId === baseGoerli.id

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [arbitrum, mainnet, goerli, arbitrumGoerli, baseGoerli],
  [
    alchemyProvider({ apiKey: AlchemyActiveKey }),
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === baseGoerli.id)
          return {
            http: QuickNodeBaseGoerliUrl || '',
            webSocket: QuickNodeBaseGoerliUrl?.replace('https', 'wss'),
          }
        return { http: '' }
      },
    }),
    publicProvider(),
  ],
  {
    batch: {
      multicall: true,
    },
  },
)
export const mainnetChains = chains.filter((c) => !isTestnet(c.id))

const { connectors } = getDefaultWallets({
  appName: 'Perennial Interface V2',
  projectId: WalletConnectProjectId,
  chains: LocalDev ? chains : [...mainnetChains, baseGoerli], // Only pass in mainnet (and basegoerli) chains to clean up the select modal. Testnets will still work
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export const DefaultChain = chains[0]

export const GraphUrls: { [chainId in SupportedChainId]: string } = {
  [arbitrum.id]: process.env.NEXT_PUBLIC_GRAPH_URL_ARBITRUM ?? '',
  [mainnet.id]: process.env.NEXT_PUBLIC_GRAPH_URL_MAINNET ?? '',
  [arbitrumGoerli.id]: process.env.NEXT_PUBLIC_GRAPH_URL_ARBITRUM_GOERLI ?? '',
  [goerli.id]: process.env.NEXT_PUBLIC_GRAPH_URL_GOERLI ?? '',
  [baseGoerli.id]: process.env.NEXT_PUBLIC_GRAPH_URL_BASE_GOERLI ?? '',
}

export const ExplorerURLs: { [chainId in SupportedChainId]: string } = {
  [mainnet.id]: 'https://etherscan.io',
  [goerli.id]: 'https://goerli.etherscan.io',
  [arbitrum.id]: 'https://arbiscan.io',
  [arbitrumGoerli.id]: 'https://goerli.arbiscan.io',
  [baseGoerli.id]: 'https://goerli.basescan.org',
}
