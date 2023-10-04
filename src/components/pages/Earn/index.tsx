import { useBreakpointValue } from '@chakra-ui/react'

import { EarnLayout, HeaderGridItem, VaultDetailGridItem, VaultSelectGridItem } from '@/components/layout/EarnLayout'
import NavBar from '@/components/shared/NavBar'
import { MigrationProvider } from '@/contexts/migrationContext'
import { VaultProvider } from '@/contexts/vaultContext'
import { useRefreshVaultsOnPriceUpdates } from '@/hooks/vaults2'

import VaultDetail from './VaultDetail'
import VaultSelect from './VaultSelect'

export default function Earn() {
  useRefreshVaultsOnPriceUpdates()
  const isBase = useBreakpointValue({ base: true, md: false })

  return (
    <VaultProvider>
      <MigrationProvider>
        <EarnLayout>
          <HeaderGridItem>
            <NavBar />
          </HeaderGridItem>
          {!isBase && (
            <VaultSelectGridItem>
              <VaultSelect />
            </VaultSelectGridItem>
          )}
          <VaultDetailGridItem>
            <VaultDetail />
          </VaultDetailGridItem>
        </EarnLayout>
      </MigrationProvider>
    </VaultProvider>
  )
}
