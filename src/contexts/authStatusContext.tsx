import { AuthenticationStatus } from '@rainbow-me/rainbowkit'
import { createContext, useContext, useState } from 'react'

import { LocalDev } from '@/constants/auth'

export type AuthStatus = AuthenticationStatus

export const StartingAuthStatus = LocalDev ? 'authenticated' : 'unauthenticated'
const AuthStatusOverlayContext = createContext({
  tosAccepted: false,
  setTosAccepted: (tosAccepted: boolean) => {
    tosAccepted
  },
  authStatus: StartingAuthStatus as AuthStatus,
  setAuthStatus: (status: AuthStatus) => {
    status
  },
})

export const AuthStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(StartingAuthStatus)
  const [tosAccepted, _setTosAccepted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('tos_accepted') === 'true'
  })

  const setTosAccepted = (tosAccepted: boolean) => {
    localStorage.setItem('tos_accepted', tosAccepted ? 'true' : 'false')
    _setTosAccepted(tosAccepted)
  }

  return (
    <AuthStatusOverlayContext.Provider value={{ authStatus, setAuthStatus, tosAccepted, setTosAccepted }}>
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
