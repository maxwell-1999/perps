import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit'
import { SiweMessage } from 'siwe'
import { Address } from 'viem'

import { TosBackendURL, jwtKey } from '@/constants/auth'

export const getJwt = (address: string) => localStorage.getItem(jwtKey(address))

export const setJwt = (address: string, jwt: string) => localStorage.setItem(jwtKey(address), jwt)

export const removeJwt = (address: string) => localStorage.removeItem(jwtKey(address))

export const login = async ({
  address,
  setAuthStatus,
  disconnect,
}: {
  address: string
  setAuthStatus: (status: string) => void
  disconnect: () => void
}) => {
  const jwt = getJwt(address)
  if (!jwt) {
    setAuthStatus('unauthenticated')
    return
  }

  try {
    const loginRes = await fetch(`${TosBackendURL}/siwe/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ address }),
    })

    if (!loginRes.ok) throw new Error('Login failed')

    setAuthStatus('authenticated')
  } catch {
    setAuthStatus('unauthenticated')
    disconnect()
    removeJwt(address)
  }
}

export const createAuthAdapter = ({ address, onVerify }: { address?: Address; onVerify: () => void }) => {
  let nonceJWT: string | null = null

  return createAuthenticationAdapter({
    getNonce: async () => {
      if (!address) throw new Error('No address provided')

      const response = await fetch(`${TosBackendURL}/siwe/nonce`)
      const res: { nonce: string; token: string } = await response.json()

      // Temporary jwt to store nonce from server
      nonceJWT = res.token

      return res.nonce
    },

    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement:
          'Sign in with Ethereum to use Perennial. By signing this message I agree to the terms of service listed here: https://app.perennial.finance/tos',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      })
    },

    getMessageBody: ({ message }) => {
      return message.prepareMessage()
    },

    verify: async ({ message, signature }) => {
      if (!address) throw new Error('No address provided')

      // Attach temp nonce jwt to request
      const jwt = nonceJWT

      const verifyRes = await fetch(`${TosBackendURL}/siwe/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ message, signature }),
      })

      const verifyJson = await verifyRes.json()

      setJwt(address, verifyJson.token)
      onVerify()

      return Boolean(verifyRes.ok)
    },

    signOut: async () => {
      if (!address) throw new Error('No address provided')

      removeJwt(address)
    },
  })
}
