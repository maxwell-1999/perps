import { createContext, useContext, useMemo, useState } from 'react'

import { PerennialVaultType, SupportedVaults } from '@/constants/vaults'
import { useChainId } from '@/hooks/network'
import { VaultSnapshot, useRefreshVaultsOnPriceUpdates, useVaultFeeAPRs, useVaultSnapshots } from '@/hooks/vaults'

type VaultContextType = {
  vaultSnapshots: VaultSnapshot[]
  status: 'idle' | 'loading' | 'error' | 'success'
  selectedVault?: `${number}`
  setSelectedVault: (index: `${number}`) => void
  feeAPRs?: { [key in PerennialVaultType]?: bigint }
}

const VaultContext = createContext<VaultContextType>({
  vaultSnapshots: [],
  status: 'loading',
  selectedVault: undefined,
  setSelectedVault: (index: `${number}`) => {
    index
  },
  feeAPRs: {},
})

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId()
  const [selectedVault, setSelectedVault] = useState<`${number}`>()
  const supportedVaults = useMemo(() => {
    return Object.keys(SupportedVaults[chainId]).map((vault) => vault as PerennialVaultType)
  }, [chainId])

  const { data, status } = useVaultSnapshots(supportedVaults)
  const { data: feeAprs } = useVaultFeeAPRs()
  const vaultSnapshots = data ?? []

  useRefreshVaultsOnPriceUpdates()

  return (
    <VaultContext.Provider value={{ vaultSnapshots, status, selectedVault, setSelectedVault, feeAPRs: feeAprs }}>
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
