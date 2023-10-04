import { Flex, Spinner } from '@chakra-ui/react'

import { useVaultContext } from '@/contexts/vaultContext'

import VaultDetail from './VaultDetail'
import VaultEmptyState from './VaultEmptyState'

export default function VaultDetailContainer() {
  const { selectedVault, vaultSnapshots, status } = useVaultContext()

  if (status !== 'success') {
    return (
      <Flex width="100%" height="100%" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }
  if (!selectedVault || !vaultSnapshots?.vault[selectedVault]) {
    return <VaultEmptyState />
  }
  const snapshot = vaultSnapshots?.vault[selectedVault]
  return <VaultDetail vault={snapshot} vaultAccountSnapshot={vaultSnapshots?.user?.[selectedVault]} />
}
