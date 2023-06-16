import { useVaultContext } from '@/contexts/vaultContext'

import VaultDetail from './VaultDetail'
import VaultEmptyState from './VaultEmptyState'

export default function VaultDetailContainer() {
  const { selectedVault, vaultSnapshots } = useVaultContext()
  if (!selectedVault) {
    return <VaultEmptyState />
  }
  const snapshot = vaultSnapshots[selectedVault]
  return <VaultDetail vault={snapshot} />
}
