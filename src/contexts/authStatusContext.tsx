import { AuthenticationStatus } from '@rainbow-me/rainbowkit'
import { getCookie } from 'cookies-next'
import { createContext, useContext, useMemo, useState } from 'react'

import { LocalDev, RestrictedCountries } from '@/constants/auth'
import { GeolocationCookie } from '@/constants/cookies'
import { isTestnet } from '@/constants/network'
import { useChainId } from '@/hooks/network'
import { useIsSanctioned } from '@/hooks/wallet'

export type AuthStatus = AuthenticationStatus

export const StartingAuthStatus = LocalDev ? 'authenticated' : 'unauthenticated'
const AuthStatusOverlayContext = createContext({
  tosAccepted: false,
  setTosAccepted: (tosAccepted: boolean) => {
    tosAccepted
  },
  geoblocked: false,
  authStatus: StartingAuthStatus as AuthStatus,
  setAuthStatus: (status: AuthStatus) => {
    status
  },
  sanctioned: false,
})

export const AuthStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId()
  const [authStatus, setAuthStatus] = useState<AuthStatus>(StartingAuthStatus)
  const [_geoblocked] = useState<boolean>(() => {
    if (LocalDev) return false
    return RestrictedCountries.includes(getCookie(GeolocationCookie)?.toString() ?? '')
  })
  const [tosAccepted, _setTosAccepted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('tos_accepted') === 'true'
  })

  const setTosAccepted = (tosAccepted: boolean) => {
    localStorage.setItem('tos_accepted', tosAccepted ? 'true' : 'false')
    _setTosAccepted(tosAccepted)
  }

  const geoblocked = useMemo(() => (isTestnet(chainId) ? false : _geoblocked), [chainId, _geoblocked])
  const { data: sanctioned } = useIsSanctioned()

  return (
    <AuthStatusOverlayContext.Provider
      value={{ authStatus, setAuthStatus, tosAccepted, setTosAccepted, geoblocked, sanctioned: Boolean(sanctioned) }}
    >
      {children}
    </AuthStatusOverlayContext.Provider>
  )
}

export const useAuthStatus = () => {
  const context = useContext(AuthStatusOverlayContext)
  if (context === undefined) {
    throw new Error('useAuthStatus must be used within a AuthStatusProvider')
  }
  return context
}
