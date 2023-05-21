import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { IntlProvider } from "react-intl";
import type { AppProps } from "next/app";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { WagmiConfig } from "wagmi";
import theme from "@ds/theme";
import English from "../../lang/compiled-locales/en.json";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig, chains } from "@/constants/network";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Hour } from "@/utils/timeUtils";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number(1n * Hour) * 1000, // 1 hour in ms
    },
  },
});

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
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains} theme={darkTheme()} modalSize="compact">
            <ChakraProvider theme={theme}>
              <CSSReset />
              <Component {...pageProps} />
            </ChakraProvider>
          </RainbowKitProvider>
        </WagmiConfig>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </IntlProvider>
  );
}
