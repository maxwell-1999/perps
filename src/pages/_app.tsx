import { CSSReset, ChakraProvider } from '@chakra-ui/react'
import { RainbowKitAuthenticationProvider, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'
import { IntlProvider } from 'react-intl'
// eslint-disable-next-line no-restricted-imports
import { WagmiConfig, useAccount, useDisconnect } from 'wagmi'

import { LocalDev } from '@/constants/auth'
import { chains, wagmiConfig } from '@/constants/network'
import { AuthStatus, AuthStatusProvider, useAuthStatus } from '@/contexts/authStatusContext'
import '@/styles/globals.css'
import { createAuthAdapter, login } from '@/utils/authUtils'

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

const AppWithAuth = ({ Component, pageProps }: AppProps) => {
  const { authStatus, setAuthStatus } = useAuthStatus()
  const { disconnect } = useDisconnect()
  const { address } = useAccount({
    onDisconnect: () => setAuthStatus('unauthenticated'),
  })

  const loginUser = useCallback(() => {
    if (address) login({ address, setAuthStatus: (status: string) => setAuthStatus(status as AuthStatus), disconnect })
  }, [address, setAuthStatus, disconnect])

  // When the address changes, try login the user
  useEffect(() => {
    if (authStatus === 'loading') loginUser()
  }, [authStatus, loginUser])

  const authAdapter = useMemo(
    () =>
      createAuthAdapter({
        address,
        onVerify: loginUser,
      }),
    [address, loginUser],
  )

  return (
    <RainbowKitAuthenticationProvider enabled={!LocalDev} adapter={authAdapter} status={authStatus}>
      <RainbowKitProvider chains={chains} theme={darkTheme()} modalSize="compact">
        <ChakraProvider theme={theme}>
          <CSSReset />
          <Component {...pageProps} />
        </ChakraProvider>
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  )
}

export default function App(props: AppProps) {
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
          <AuthStatusProvider>
            <AppWithAuth {...props} />
          </AuthStatusProvider>
        </WagmiConfig>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </IntlProvider>
  )
}
