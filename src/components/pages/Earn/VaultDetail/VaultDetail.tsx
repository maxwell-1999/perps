import { Flex, useBreakpointValue, useColorModeValue, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import Toast, { ToastMessage } from '@/components/shared/Toast'
import { VaultMetadata } from '@/constants/vaults'
import { useChainId } from '@/hooks/network'
import { VaultSnapshot, useVaultUserSnapshot } from '@/hooks/vaults'
import { useBalances } from '@/hooks/wallet'
import { Big18Math } from '@/utils/big18Utils'
import { usePrevious } from '@/utils/hooks'

import colors from '@ds/theme/colors'

import MobileVaultSelect from '../VaultSelect/MobileVaultSelector'
import { useVaultDescription } from '../hooks'
import ClaimModal from './ClaimModal'
import VaultForm from './VaultForm'
import { CapactiyCard, ClaimCard, PositionCard, RiskCard, SupportedAssetsSection, VaultDetailTitle } from './components'
import { useExposure, usePnl, useVaultDetailCopy } from './hooks'

export default function VaultDetail({ vault }: { vault: VaultSnapshot }) {
  const chainId = useChainId()
  const toast = useToast()
  const isBase = useBreakpointValue({ base: true, md: false })
  const [showClaimModal, setShowClaimModal] = useState(false)
  const vaultDescription = useVaultDescription()
  const { data: balances } = useBalances()
  const copy = useVaultDetailCopy()

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
  const hasPendingRedemptions = !Big18Math.isZero(vaultUserSnapshot?.pendingRedemptionAmount ?? 0n)
  const positionUpdating = Boolean(
    vaultUserSnapshot &&
      (!Big18Math.isZero(vaultUserSnapshot.pendingDepositAmount) ||
        !Big18Math.isZero(vaultUserSnapshot.pendingRedemptionAmount)),
  )
  const prevPositionUpdating = usePrevious(positionUpdating)

  useEffect(() => {
    if (prevPositionUpdating && !positionUpdating) {
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.positionSettled}
            onClose={onClose}
            body={<ToastMessage message={copy.yourPositionHasSettled} />}
          />
        ),
      })
    }
  }, [positionUpdating, prevPositionUpdating, toast, copy])

  const showClaimCard = vaultUserSnapshot && (hasClaimable || hasPendingRedemptions)

  return (
    <>
      {showClaimModal && vaultUserSnapshot && (
        <ClaimModal
          onClose={() => setShowClaimModal(false)}
          vaultName={vaultName}
          vaultSnapshot={vault}
          vaultUserSnapshot={vaultUserSnapshot}
          balances={balances}
        />
      )}
      <Flex height="100%" width="100%" pt={10} px={14} bg={alpha5}>
        <Flex flexDirection="column" mr={isBase ? 0 : 9} width={isBase ? '100%' : '50%'}>
          <MobileVaultSelect />
          <VaultDetailTitle name={vaultName} description={vaultDescription[symbol]} />
          {metadata && <SupportedAssetsSection supportedAssets={metadata.assets} />}
          {isBase && (
            <>
              {showClaimCard && (
                <ClaimCard
                  setShowClaimModal={setShowClaimModal}
                  vaultUserSnapshot={vaultUserSnapshot}
                  vaultName={vaultName}
                />
              )}
              <PositionCard vaultUserSnapshot={vaultUserSnapshot} pnl={pnl} positionUpdating={positionUpdating} />
              <VaultForm
                vaultSnapshot={vault}
                vaultName={vaultName}
                vaultUserSnapshot={vaultUserSnapshot}
                balances={balances}
              />
            </>
          )}
          <RiskCard exposure={exposureData?.exposure} isLong={exposureData?.isLongExposure} />
          <CapactiyCard collateral={totalAssets} capacity={maxCollateral} />
        </Flex>
        {!isBase && (
          <Flex flexDirection="column" width="50%" pt={7}>
            {showClaimCard && (
              <ClaimCard
                setShowClaimModal={setShowClaimModal}
                vaultName={vaultName}
                vaultUserSnapshot={vaultUserSnapshot}
              />
            )}
            <PositionCard vaultUserSnapshot={vaultUserSnapshot} pnl={pnl} positionUpdating={positionUpdating} />
            <VaultForm
              vaultSnapshot={vault}
              vaultName={vaultName}
              vaultUserSnapshot={vaultUserSnapshot}
              balances={balances}
            />
          </Flex>
        )}
      </Flex>
    </>
  )
}
