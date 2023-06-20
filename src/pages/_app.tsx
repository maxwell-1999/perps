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

import SanctionModal from '@/components/SanctionModal'
import { LocalDev } from '@/constants/auth'
import { chains, wagmiConfig } from '@/constants/network'
import { AuthStatusProvider, StartingAuthStatus, useAuthStatus } from '@/contexts/authStatusContext'
import '@/styles/globals.css'
import { createAuthAdapter, getJwt, login } from '@/utils/authUtils'
import { usePrevious } from '@/utils/hooks'

import theme from '@ds/theme'

import { Hour } from '@utils/timeUtils'

import English from '../../lang/compiled-locales/en.json'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number(1n * Hour) * 1000, // 1 hour in ms
    },
  },
})

const AppWithAuth = ({ Component, pageProps }: AppProps) => {
  const { authStatus, setAuthStatus, sanctioned } = useAuthStatus()
  const { disconnect } = useDisconnect()

  const { address } = useAccount({
    onConnect: ({ address }) => {
      if (address && !!getJwt(address)) loginUser()
      else setAuthStatus(StartingAuthStatus)
    },
    onDisconnect: () => {
      setAuthStatus(StartingAuthStatus)
      queryClient.invalidateQueries()
    },
  })
  const prevAddress = usePrevious(address)

  const loginUser = useCallback(() => {
    if (address) login({ address, setAuthStatus, disconnect })
  }, [address, setAuthStatus, disconnect])

  useEffect(() => {
    // If the address changes and there is a JWT for the new address, try logging in, otherwise set the auth status to unauthenticated
    if (prevAddress && address && address !== prevAddress) {
      if (!!getJwt(address)) loginUser()
      else setAuthStatus(StartingAuthStatus)
      queryClient.invalidateQueries()
    }
  }, [address, prevAddress, setAuthStatus, loginUser])

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
          {sanctioned ? <SanctionModal /> : <Component {...pageProps} />}
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
