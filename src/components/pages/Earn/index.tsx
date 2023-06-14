import { useBreakpointValue } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

import { EarnLayout, HeaderGridItem, VaultDetailGridItem, VaultSelectGridItem } from '@/components/layout/EarnLayout'

import VaultEmptyState from './VaultDetail'
import VaultSelect from './VaultSelect'

const NavBar = dynamic(() => import('@/components/shared/NavBar'), {
  ssr: false,
})

export default function Earn() {
  const isBase = useBreakpointValue({ base: true, md: false })
  return (
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
        <VaultEmptyState />
      </VaultDetailGridItem>
    </EarnLayout>
  )
}
