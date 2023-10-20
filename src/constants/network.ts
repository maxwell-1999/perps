import arbLogo from '@public/icons/arb.png'
import baseLogo from '@public/icons/base.png'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { Address } from 'viem'
import { arbitrum, arbitrumGoerli, baseGoerli, goerli } from 'viem/chains'
import { configureChains, createConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { Big6Math } from '@/utils/big6Utils'

import { LocalDev } from './auth'
import { OracleFactoryAddresses } from './contracts'
import { PositionSide2 } from './markets'

export const AlchemyProdKeys = process.env.NEXT_PUBLIC_ALCHEMY_PROD_KEYS?.split(',').map((k) => k.trim())
export const QuickNodeBaseGoerliUrl = process.env.NEXT_PUBLIC_QUICKNODE_URL_BASE_GOERLI
export const WalletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!AlchemyProdKeys || !AlchemyProdKeys.length) throw new Error('Missing alchemy key configuration')
if (!WalletConnectProjectId) throw new Error('Missing walletconnect project id')

// Random select a key from available keys
export const AlchemyActiveKey = AlchemyProdKeys[Math.floor(Math.random() * AlchemyProdKeys.length)]
export const SupportedChainIds = [arbitrum.id, arbitrumGoerli.id, baseGoerli.id] as const
export type SupportedChainId = (typeof SupportedChainIds)[number]
export const isSupportedChain = (chainId?: number) =>
  chainId !== undefined && SupportedChainIds.includes(chainId as SupportedChainId)
export const isTestnet = (chainId?: number) =>
  chainId === goerli.id || chainId === arbitrumGoerli.id || chainId === baseGoerli.id

export const { chains, publicClient } = configureChains(
  [arbitrum, arbitrumGoerli],
  [alchemyProvider({ apiKey: AlchemyActiveKey }), publicProvider()],
  {
    batch: {
      multicall: true,
    },
  },
)
export const mainnetChains = [...chains.filter((c) => !isTestnet(c.id))] // TODO revert for mainnet

const { connectors } = getDefaultWallets({
  appName: 'Perennial Interface V2',
  projectId: WalletConnectProjectId,
  chains: LocalDev ? chains : [...mainnetChains], // Only pass in mainnet chains to clean up the select modal. Testnets will still work
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export const DefaultChain = chains[0]

export const GraphUrls: { [chainId in SupportedChainId]: string } = {
  [arbitrum.id]: process.env.NEXT_PUBLIC_GRAPH_URL_ARBITRUM ?? '',
  [arbitrumGoerli.id]: process.env.NEXT_PUBLIC_GRAPH_URL_ARBITRUM_GOERLI ?? '',
  [baseGoerli.id]: process.env.NEXT_PUBLIC_GRAPH_URL_BASE_GOERLI ?? '',
}

export const GraphUrls2: { [chainId in SupportedChainId]: string } = {
  [arbitrum.id]: process.env.NEXT_PUBLIC_GRAPH_URL_ARBITRUM_2 ?? '',
  [arbitrumGoerli.id]: process.env.NEXT_PUBLIC_GRAPH_URL_ARBITRUM_GOERLI_2 ?? '',
  [baseGoerli.id]: process.env.NEXT_PUBLIC_GRAPH_URL_BASE_GOERLI_2 ?? '',
}

export const ExplorerURLs: { [chainId in SupportedChainId]: string } = {
  [arbitrum.id]: arbitrum.blockExplorers.default.url,
  [arbitrumGoerli.id]: arbitrumGoerli.blockExplorers.default.url,
  [baseGoerli.id]: baseGoerli.blockExplorers.default.url,
}

export const ExplorerNames: { [chainId in SupportedChainId]: string } = {
  [arbitrum.id]: arbitrum.blockExplorers.default.name,
  [arbitrumGoerli.id]: arbitrumGoerli.blockExplorers.default.name,
  [baseGoerli.id]: baseGoerli.blockExplorers.default.name,
}

export const networkToIcon: { [chainId in SupportedChainId]: string } = {
  [arbitrum.id]: arbLogo,
  [arbitrumGoerli.id]: arbLogo,
  [baseGoerli.id]: baseLogo,
}

export const interfaceFeeBps: {
  [chainId in SupportedChainId]?: { feeAmount: { [key in PositionSide2]: bigint }; feeRecipientAddress: Address }
} = {
  [arbitrumGoerli.id]: {
    feeAmount: {
      [PositionSide2.short]: Big6Math.fromFloatString('0.0001'), // 1bps
      [PositionSide2.long]: Big6Math.fromFloatString('0.0001'), // 1bps
      [PositionSide2.maker]: 0n,
      [PositionSide2.none]: 0n,
    },
    feeRecipientAddress: OracleFactoryAddresses[arbitrumGoerli.id],
  },
  [arbitrum.id]: {
    feeAmount: {
      [PositionSide2.short]: 0n,
      [PositionSide2.long]: 0n,
      [PositionSide2.maker]: 0n,
      [PositionSide2.none]: 0n,
    },
    feeRecipientAddress: OracleFactoryAddresses[arbitrum.id],
  },
}

export const PythMainnetUrl = process.env.NEXT_PUBLIC_PYTH_PRICE_SERVICE_URL_MAINNET
export const PythTestnetUrl = process.env.NEXT_PUBLIC_PYTH_PRICE_SERVICE_URL_TESTNET
export const PythDatafeedUrl = process.env.NEXT_PUBLIC_PYTH_DATAFEED_URL

export const metamaskTxRejectedError = 'MetaMask Tx Signature: User denied transaction signature.'
