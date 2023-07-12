import { createContext, useContext, useMemo, useState } from 'react'

import { PerennialVaultType, SupportedVaults } from '@/constants/vaults'
import { useChainId } from '@/hooks/network'
import {
  VaultSnapshot,
  VaultUserSnapshot,
  useRefreshVaultsOnPriceUpdates,
  useVaultFeeAPRs,
  useVaultSnapshots,
  useVaultUserSnapshots,
} from '@/hooks/vaults'

type VaultContextType = {
  vaultSnapshots: VaultSnapshot[]
  status: 'idle' | 'loading' | 'error' | 'success'
  selectedVault?: `${number}`
  setSelectedVault: (index: `${number}`) => void
  feeAPRs?: { [key in PerennialVaultType]?: bigint }
  vaultUserSnapshots?: { [key in PerennialVaultType]?: VaultUserSnapshot }
  vaultUserSnapshotsStatus: 'idle' | 'loading' | 'error' | 'success'
}

const VaultContext = createContext<VaultContextType>({
  vaultSnapshots: [],
  status: 'loading',
  selectedVault: undefined,
  setSelectedVault: (index: `${number}`) => {
    index
  },
  feeAPRs: {},
  vaultUserSnapshots: {},
  vaultUserSnapshotsStatus: 'loading',
})

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId()
  const [selectedVault, setSelectedVault] = useState<`${number}`>()
  const supportedVaults = useMemo(() => {
    return Object.keys(SupportedVaults[chainId]).map((vault) => vault as PerennialVaultType)
  }, [chainId])

  const { data, status } = useVaultSnapshots(supportedVaults)
  const { data: vaultUserSnapshots, status: vaultUserSnapshotsStatus } = useVaultUserSnapshots(supportedVaults)

  const { data: feeAprs } = useVaultFeeAPRs()
  const vaultSnapshots = data ?? []

  useRefreshVaultsOnPriceUpdates()

  return (
    <VaultContext.Provider
      value={{
        vaultSnapshots,
        vaultUserSnapshots,
        vaultUserSnapshotsStatus,
        status,
        selectedVault,
        setSelectedVault,
        feeAPRs: feeAprs,
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
