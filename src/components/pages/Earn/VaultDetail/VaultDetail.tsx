import { Flex, useBreakpointValue, useColorModeValue } from '@chakra-ui/react'
import { useState } from 'react'

import { VaultMetadata } from '@/constants/vaults'
import { useChainId } from '@/hooks/network'
import { VaultSnapshot, useVaultUserSnapshot } from '@/hooks/vaults'
import { Big18Math } from '@/utils/big18Utils'

import colors from '@ds/theme/colors'

import MobileVaultSelect from '../VaultSelect/MobileVaultSelector'
import { useVaultDescription } from '../hooks'
import VaultForm from './VaultForm'
import { CapactiyCard, ClaimCard, PositionCard, RiskCard, SupportedAssetsSection, VaultDetailTitle } from './components'
import { useExposure, usePnl } from './hooks'

export default function VaultDetail({ vault }: { vault: VaultSnapshot }) {
  const chainId = useChainId()
  const isBase = useBreakpointValue({ base: true, md: false })
  const [showClaimModal, setShowClaimModal] = useState(false)
  const vaultDescription = useVaultDescription()

  const { symbol, name, totalAssets, maxCollateral } = vault

  const { data: vaultUserSnapshot } = useVaultUserSnapshot(symbol)
  const exposureData = useExposure({
    vault,
  })
  const pnl = usePnl({ vault, vaultUserSnapshot })

  const alpha5 = useColorModeValue(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])
  const metadata = VaultMetadata[chainId][symbol]
  const vaultName = metadata?.name ?? name
  const hasClaimable = !Big18Math.isZero(vaultUserSnapshot?.claimable ?? 0n)
  const positionUpdating = Boolean(
    vaultUserSnapshot &&
      (!Big18Math.isZero(vaultUserSnapshot.pendingDepositAmount) ||
        !Big18Math.isZero(vaultUserSnapshot.pendingRedemptionAmount)),
  )

  return (
    <Flex height="100%" width="100%" pt={10} px={14} bg={alpha5}>
      <Flex flexDirection="column" mr={isBase ? 0 : 9} width={isBase ? '100%' : '50%'}>
        <MobileVaultSelect />
        <VaultDetailTitle name={vaultName} description={vaultDescription[symbol]} />
        {metadata && <SupportedAssetsSection supportedAssets={metadata.assets} />}
        {isBase && (
          <>
            {hasClaimable && (
              <ClaimCard
                setShowClaimModal={setShowClaimModal}
                claimable={vaultUserSnapshot?.claimable ?? 0n}
                vaultName={vaultName}
              />
            )}

            <PositionCard vaultUserSnapshot={vaultUserSnapshot} pnl={pnl} positionUpdating={positionUpdating} />
            <VaultForm
              vaultSnapshot={vault}
              vaultName={vaultName}
              vaultUserSnapshot={vaultUserSnapshot}
              setShowClaimModal={setShowClaimModal}
              showClaimModal={showClaimModal}
              positionUpdating={positionUpdating}
            />
          </>
        )}
        <RiskCard exposure={exposureData?.exposure} isLong={exposureData?.isLongExposure} />
        <CapactiyCard collateral={totalAssets} capacity={maxCollateral} />
      </Flex>
      {!isBase && (
        <Flex flexDirection="column" width="50%" pt={7}>
          {hasClaimable && (
            <ClaimCard
              setShowClaimModal={setShowClaimModal}
              claimable={vaultUserSnapshot?.claimable ?? 0n}
              vaultName={vaultName}
            />
          )}
          <PositionCard vaultUserSnapshot={vaultUserSnapshot} pnl={pnl} positionUpdating={positionUpdating} />
          <VaultForm
            vaultSnapshot={vault}
            vaultName={vaultName}
            vaultUserSnapshot={vaultUserSnapshot}
            setShowClaimModal={setShowClaimModal}
            showClaimModal={showClaimModal}
            positionUpdating={positionUpdating}
          />
        </Flex>
      )}
    </Flex>
  )
}
