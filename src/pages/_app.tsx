import { CSSReset, ChakraProvider } from '@chakra-ui/react'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { IntlProvider } from 'react-intl'
import { WagmiConfig } from 'wagmi'

import { chains, wagmiConfig } from '@/constants/network'
import '@/styles/globals.css'

import theme from '@ds/theme'

import { Hour } from '@utils/timeUtils'

import English from '../../lang/compiled-locales/en.json'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true, // Keep previous data when fetching new data
      staleTime: Number(1n * Hour) * 1000, // 1 hour in ms
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  const { locale = 'en', defaultLocale = 'en' } = useRouter()

  const messages = useMemo(() => {
    // add new languages here.
    switch (locale) {
      case 'en':
      case 'en-US':
        return English
      default:
        return English
    }
  }, [locale])

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
  )
}
