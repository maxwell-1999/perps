import { useBreakpointValue } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

import { EarnLayout, HeaderGridItem, VaultDetailGridItem, VaultSelectGridItem } from '@/components/layout/EarnLayout'
import { VaultProvider } from '@/contexts/vaultContext'

import VaultDetail from './VaultDetail'
import VaultSelect from './VaultSelect'

const NavBar = dynamic(() => import('@/components/shared/NavBar'), {
  ssr: false,
})

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
