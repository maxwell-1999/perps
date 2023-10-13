import { AuthenticationStatus } from '@rainbow-me/rainbowkit'
import { createContext, useContext, useMemo, useState } from 'react'

import { LocalDev } from '@/constants/auth'
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
  vpnDetected: false,
  setVpnDetected: (vpnDetected: boolean) => {
    vpnDetected
  },
  authStatus: StartingAuthStatus as AuthStatus,
  setAuthStatus: (status: AuthStatus) => {
    status
  },
  geoblocked: false,
  setGeoblocked: (geoblocked: boolean) => {
    geoblocked
  },
  sanctioned: false,
})

export const AuthStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId()
  const [authStatus, setAuthStatus] = useState<AuthStatus>(StartingAuthStatus)
  const [_geoblocked, setGeoblocked] = useState<boolean>(false)
  const [vpnDetected, setVpnDetected] = useState<boolean>(false)
  const [tosAccepted, _setTosAccepted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('tos_accepted') === 'true'
  })

  const setTosAccepted = (tosAccepted: boolean) => {
    localStorage.setItem('tos_accepted', tosAccepted ? 'true' : 'false')
    _setTosAccepted(tosAccepted)
  }

  const geoblocked = useMemo(
    () => (isTestnet(chainId) ? false : _geoblocked || vpnDetected),
    [chainId, _geoblocked, vpnDetected],
  )
  const { data: sanctioned } = useIsSanctioned()

  return (
    <AuthStatusOverlayContext.Provider
      value={{
        authStatus,
        setAuthStatus,
        tosAccepted,
        setTosAccepted,
        vpnDetected,
        setVpnDetected,
        geoblocked,
        setGeoblocked,
        sanctioned: Boolean(sanctioned),
      }}
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
