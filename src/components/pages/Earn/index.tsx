import { useBreakpointValue } from '@chakra-ui/react'

import { EarnLayout, HeaderGridItem, VaultDetailGridItem, VaultSelectGridItem } from '@/components/layout/EarnLayout'
import NavBar from '@/components/shared/NavBar'
import { VaultProvider } from '@/contexts/vaultContext'

import VaultDetail from './VaultDetail'
import VaultSelect from './VaultSelect'

export default function Earn() {
  const isBase = useBreakpointValue({ base: true, md: false })

  return (
    <VaultProvider>
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
    </VaultProvider>
  )
}
