import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { ConnectKitProvider } from "connectkit";
import { WagmiConfig } from "wagmi";
import theme from "@ds/theme";
import { client, connectKitProviderOptions } from "../constants";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider options={connectKitProviderOptions} theme="midnight">
        <ChakraProvider theme={theme}>
          <CSSReset />
          <Component {...pageProps} />
        </ChakraProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
