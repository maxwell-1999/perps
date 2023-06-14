import { useBreakpointValue } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

import { EarnLayout, HeaderGridItem, VaultDetailGridItem, VaultSelectGridItem } from '@/components/layout/EarnLayout'

import VaultSelect from './VaultSelect'

const NavBar = dynamic(() => import('@/components/shared/NavBar'), {
  ssr: false,
})

export default function Earn() {
  const isBase = useBreakpointValue({ base: true, md: false })
  const VAULT_DETAIL = 'Vault Detail'
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
        <div>{VAULT_DETAIL}</div>
      </VaultDetailGridItem>
    </EarnLayout>
  )
}
