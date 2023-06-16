import { createContext, useContext, useMemo } from 'react'

import { PerennialVaultType, SupportedVaults, VaultSnapshot } from '@/constants/vaults'
import { useChainId } from '@/hooks/network'
import { useVaultSnapshots } from '@/hooks/vaults'

type VaultContextType = {
  vaultSnapshots: VaultSnapshot[]
  status: 'idle' | 'loading' | 'error' | 'success'
}

const VaultContext = createContext<VaultContextType>({
  vaultSnapshots: [],
  status: 'loading',
})

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId()
  const supportedVaults = useMemo(() => {
    return Object.keys(SupportedVaults[chainId]).map((vault) => vault as PerennialVaultType)
  }, [chainId])

  const { data, status } = useVaultSnapshots(supportedVaults)
  const vaultSnapshots = data ?? []

  return <VaultContext.Provider value={{ vaultSnapshots, status }}>{children}</VaultContext.Provider>
}

export const useVaultContext = () => {
  const context = useContext(VaultContext)
  if (!context) {
    throw new Error('useVaultContext must be used within a VaultProvider')
  }
  return context
}
