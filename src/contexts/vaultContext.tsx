import { createContext, useContext, useMemo, useState } from 'react'

import { PerennialVaultType, SupportedVaults, VaultSnapshot } from '@/constants/vaults'
import { useChainId } from '@/hooks/network'
import { useVaultSnapshots } from '@/hooks/vaults'

type VaultContextType = {
  vaultSnapshots: VaultSnapshot[]
  status: 'idle' | 'loading' | 'error' | 'success'
  selectedVault?: `${number}`
  setSelectedVault: (index: `${number}`) => void
}

const VaultContext = createContext<VaultContextType>({
  vaultSnapshots: [],
  status: 'loading',
  selectedVault: undefined,
  setSelectedVault: (index: `${number}`) => {
    index
  },
})

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId()
  const [selectedVault, setSelectedVault] = useState<`${number}`>()
  const supportedVaults = useMemo(() => {
    return Object.keys(SupportedVaults[chainId]).map((vault) => vault as PerennialVaultType)
  }, [chainId])

  const { data, status } = useVaultSnapshots(supportedVaults)
  const vaultSnapshots = data ?? []

  return (
    <VaultContext.Provider value={{ vaultSnapshots, status, selectedVault, setSelectedVault }}>
      {children}
    </VaultContext.Provider>
  )
}

export const useVaultContext = () => {
  const context = useContext(VaultContext)
  if (!context) {
    throw new Error('useVaultContext must be used within a VaultProvider')
  }
  return context
}
