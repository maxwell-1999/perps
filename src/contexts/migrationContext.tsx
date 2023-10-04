import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ObjectEntry } from 'type-fest/source/entry'

import { SupportedChainId } from '@/constants/network'
import { PerennialVaultType, SupportedVaults, VaultMetadata, VaultMetadataV1 } from '@/constants/vaults'
import { useChainId } from '@/hooks/network'
import { VaultSnapshot, VaultUserSnapshot, useVaultSnapshots, useVaultUserSnapshots } from '@/hooks/vaults'

export type VaultUserSnapshotEntry = ObjectEntry<{ alpha?: VaultUserSnapshot; bravo?: VaultUserSnapshot }>

type MigrationContextType = {
  withdrawnAmount: bigint
  setWithdrawnAmount: (amount: bigint) => void
  vaultsWithBalances: VaultUserSnapshotEntry[]
  v1VaultSnapshots: VaultSnapshot[]
  selectedVault?: PerennialVaultType
  setSelectedVault: (vault: PerennialVaultType) => void
  v1VaultMetadata?: (typeof VaultMetadata)[SupportedChainId]
  selectedVaultSnapshot?: VaultSnapshot
  selectedVaultUserSnapshot?: VaultUserSnapshot
}

const MigrationContext = createContext<MigrationContextType>({
  withdrawnAmount: 0n,
  setWithdrawnAmount: (amount: bigint) => {
    amount
  },
  vaultsWithBalances: [],
  v1VaultSnapshots: [],
  setSelectedVault: (vault: PerennialVaultType) => {
    vault
  },
  selectedVault: undefined,
  v1VaultMetadata: undefined,
  selectedVaultSnapshot: undefined,
  selectedVaultUserSnapshot: undefined,
})

export const MigrationProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId()
  const supportedVaults = useMemo(() => {
    return Object.keys(SupportedVaults[chainId]).map((vault) => vault as PerennialVaultType)
  }, [chainId])
  const { data: vaultSnapshots } = useVaultSnapshots(supportedVaults)
  const { data: vaultUserSnapshots } = useVaultUserSnapshots(supportedVaults)
  const [withdrawnAmount, setWithdrawnAmount] = useState<bigint>(0n)
  const [selectedVault, setSelectedVault] = useState<PerennialVaultType>()

  const v1VaultMetadata = VaultMetadataV1[chainId]
  const vaultsWithBalances = Object.entries(vaultUserSnapshots ?? {}).filter(([, snapshot]) => {
    const shares = snapshot?.assets ?? 0n
    const claimable = snapshot?.claimable ?? 0n
    const pendingWithdrawAmount = snapshot?.pendingRedemptionAmount ?? 0n
    return !!shares || !!claimable || !!pendingWithdrawAmount
  })

  useEffect(() => {
    if (!selectedVault && vaultsWithBalances.length > 0 && vaultSnapshots) {
      const initialVault = vaultsWithBalances[0]
      setSelectedVault(initialVault[0])
    }
  }, [selectedVault, vaultsWithBalances, vaultSnapshots])

  return (
    <MigrationContext.Provider
      value={{
        vaultsWithBalances: vaultsWithBalances ?? [],
        v1VaultSnapshots: vaultSnapshots ?? [],
        withdrawnAmount,
        setWithdrawnAmount,
        selectedVault,
        setSelectedVault,
        v1VaultMetadata,
        selectedVaultUserSnapshot: selectedVault ? vaultUserSnapshots?.[selectedVault] : undefined,
        selectedVaultSnapshot: selectedVault
          ? vaultSnapshots?.find((snapshot) => snapshot.vaultType === selectedVault)
          : undefined,
      }}
    >
      {children}
    </MigrationContext.Provider>
  )
}

export const useMigrationContext = () => {
  const context = useContext(MigrationContext)
  if (!context) {
    throw new Error('useMigrationContext must be used within a MigrationProvider')
  }
  return context
}
