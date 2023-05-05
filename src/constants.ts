import { configureChains, mainnet, goerli } from "wagmi";
import { arbitrum, arbitrumGoerli, baseGoerli } from "@wagmi/core/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

export const MINUTE = 60;
export const HOUR = 60 * MINUTE;
export const GEOLOCATION_COOKIE = "perennial_user_geolocation";
export const ALCHEMY_PROD_KEYS = process.env.NEXT_PUBLIC_ALCHEMY_PROD_KEYS?.split(",").map((k) =>
  k.trim(),
);

if (!ALCHEMY_PROD_KEYS || !ALCHEMY_PROD_KEYS.length) {
  throw new Error("Missing alchemy key configuration");
}

// Random select a key from available keys
export const ALCHEMY_ACTIVE_KEY =
  ALCHEMY_PROD_KEYS[Math.floor(Math.random() * ALCHEMY_PROD_KEYS.length)];

export const { chains, provider } = configureChains(
  [arbitrum, mainnet, goerli, arbitrumGoerli, baseGoerli],
  [alchemyProvider({ apiKey: ALCHEMY_ACTIVE_KEY }), publicProvider()],
);

export const connectKitProviderOptions = {
  walletConnectName: "WalletConnect",
  embedGoogleFonts: true,
  hideNoWalletCTA: true,
  hideQuestionMarkCTA: true,
  initialChainId: 0,
};

export const clientConfig = {
  appName: "Perennial Interface V2",
  alchemyId: ALCHEMY_ACTIVE_KEY,
  chains,
  provider,
};
