import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { Chain, arbitrum, arbitrumGoerli, baseGoerli, goerli, mainnet } from '@wagmi/chains'
import { configureChains, createConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

export const AlchemyProdKeys = process.env.NEXT_PUBLIC_ALCHEMY_PROD_KEYS?.split(',').map((k) => k.trim())
export const WalletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!AlchemyProdKeys || !AlchemyProdKeys.length) throw new Error('Missing alchemy key configuration')
if (!WalletConnectProjectId) throw new Error('Missing walletconnect project id')

// Random select a key from available keys
export const AlchemyActiveKey = AlchemyProdKeys[Math.floor(Math.random() * AlchemyProdKeys.length)]

export const SupportedChainIds = [arbitrum.id, mainnet.id, arbitrumGoerli.id, goerli.id, baseGoerli.id] as const
export type SupportedChainId = (typeof SupportedChainIds)[number]

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [arbitrum, mainnet, goerli, arbitrumGoerli, baseGoerli],
  [alchemyProvider({ apiKey: AlchemyActiveKey }), publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: 'Perennial Interface V2',
  projectId: WalletConnectProjectId,
  chains,
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export const DefaultChain = chains[0]
export const isSupportedChain = (chain?: Chain) =>
  chain !== undefined && SupportedChainIds.includes(chain.id as SupportedChainId)

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
