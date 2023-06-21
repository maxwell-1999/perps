import { Flex, useBreakpointValue, useColorModeValue } from '@chakra-ui/react'

import { VaultMetadata, VaultSnapshot } from '@/constants/vaults'
import { useChainId } from '@/hooks/network'
import { useVaultUserSnapshot } from '@/hooks/vaults'

import colors from '@ds/theme/colors'

import MobileVaultSelect from '../VaultSelect/MobileVaultSelector'
import VaultForm from './VaultForm'
import { CapactiyCard, PositionCard, RiskCard, SupportedAssetsSection, VaultDetailTitle } from './components'
import { useExposure, usePnl } from './hooks'

export default function VaultDetail({ vault }: { vault: VaultSnapshot }) {
  const chainId = useChainId()
  const isBase = useBreakpointValue({ base: true, md: false })

  const { symbol, name, totalAssets, maxCollateral } = vault

  const { data: vaultUserSnapshot } = useVaultUserSnapshot(symbol)
  const metadata = VaultMetadata[chainId][symbol]
  const vaultName = metadata?.name ?? name

  const exposureData = useExposure({
    vault,
  })
  const pnl = usePnl({ vault, vaultUserSnapshot })

  const alpha5 = useColorModeValue(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])

  return (
    <Flex height="100%" width="100%" pt={10} px={14} bg={alpha5}>
      <Flex flexDirection="column" mr={isBase ? 0 : 9} width={isBase ? '100%' : '50%'}>
        <MobileVaultSelect />
        <VaultDetailTitle
          name={vaultName}
          description="Some description of the vault can go here to let people know why they should deposit"
        />
        {metadata && <SupportedAssetsSection supportedAssets={metadata.assets} />}
        {isBase && (
          <>
            <PositionCard vaultUserSnapshot={vaultUserSnapshot} pnl={pnl} />
            <VaultForm vaultSnapshot={vault} vaultName={vaultName} vaultUserSnapshot={vaultUserSnapshot} />
          </>
        )}
        <RiskCard exposure={exposureData?.exposure} isLong={exposureData?.isLongExposure} />
        <CapactiyCard collateral={totalAssets} capacity={maxCollateral} />
      </Flex>
      {!isBase && (
        <Flex flexDirection="column" width="50%" pt={7}>
          <PositionCard vaultUserSnapshot={vaultUserSnapshot} pnl={pnl} />
          <VaultForm vaultSnapshot={vault} vaultName={vaultName} vaultUserSnapshot={vaultUserSnapshot} />
        </Flex>
      )}
    </Flex>
  )
}

// No position
