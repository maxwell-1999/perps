import { createContext, useContext, useState } from 'react'

import { PerennialVaultType } from '@/constants/vaults'
import { VaultSnapshots, useVaultSnapshots2 } from '@/hooks/vaults2'

type VaultContextType = {
  vaultSnapshots?: VaultSnapshots
  status: 'idle' | 'loading' | 'error' | 'success'
  selectedVault?: PerennialVaultType
  setSelectedVault: (type?: PerennialVaultType) => void
}

const VaultContext = createContext<VaultContextType>({
  vaultSnapshots: undefined,
  status: 'loading',
  selectedVault: undefined,
  setSelectedVault: (index?: PerennialVaultType) => {
    index
  },
})

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedVault, setSelectedVault] = useState<PerennialVaultType>()
  const { data: vaultSnapshots, status } = useVaultSnapshots2()

  return (
    <VaultContext.Provider
      value={{
        vaultSnapshots,
        status,
        selectedVault,
        setSelectedVault,
      }}
    >
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
