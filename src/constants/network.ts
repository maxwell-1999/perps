import { configureChains, createConfig } from "wagmi";
import { Chain, mainnet, arbitrum, arbitrumGoerli, baseGoerli, goerli } from "@wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";

export const AlchemyProdKeys = process.env.NEXT_PUBLIC_ALCHEMY_PROD_KEYS?.split(",").map((k) =>
  k.trim(),
);
export const WalletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!AlchemyProdKeys || !AlchemyProdKeys.length)
  throw new Error("Missing alchemy key configuration");
if (!WalletConnectProjectId) throw new Error("Missing walletconnect project id");

// Random select a key from available keys
export const AlchemyActiveKey = AlchemyProdKeys[Math.floor(Math.random() * AlchemyProdKeys.length)];

export const SupportedChainIds = [
  arbitrum.id,
  mainnet.id,
  arbitrumGoerli.id,
  goerli.id,
  baseGoerli.id,
] as const;
export type SupportedChainId = (typeof SupportedChainIds)[number];

export const { chains, publicClient } = configureChains(
  [arbitrum, mainnet, goerli, arbitrumGoerli, baseGoerli],
  [alchemyProvider({ apiKey: AlchemyActiveKey }), publicProvider()],
);

const { connectors } = getDefaultWallets({
  appName: "Perennial Interface V2",
  projectId: WalletConnectProjectId,
  chains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const DefaultChain = chains[0];
export const isSupportedChain = (chain?: Chain) =>
  chain !== undefined && SupportedChainIds.includes(chain.id as SupportedChainId);
