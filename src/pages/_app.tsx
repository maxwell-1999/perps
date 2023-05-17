import "@/styles/globals.css";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { IntlProvider } from "react-intl";
import type { AppProps } from "next/app";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { WagmiConfig, createClient } from "wagmi";
import theme from "@ds/theme";

import { connectKitProviderOptions, clientConfig } from "../constants";
import English from "../../lang/compiled-locales/en.json";

const client = createClient(getDefaultClient(clientConfig));

export default function App({ Component, pageProps }: AppProps) {
  const { locale = "en", defaultLocale = "en" } = useRouter();

  const messages = useMemo(() => {
    // add new languages here.
    switch (locale) {
      case "en":
      case "en-US":
        return English;
      default:
        return English;
    }
  }, [locale]);

  return (
    <IntlProvider locale={locale} defaultLocale={defaultLocale} messages={messages}>
      <WagmiConfig client={client}>
        <ConnectKitProvider options={connectKitProviderOptions} theme="midnight">
          <ChakraProvider theme={theme}>
            <CSSReset />
            <Component {...pageProps} />
          </ChakraProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </IntlProvider>
  );
}
