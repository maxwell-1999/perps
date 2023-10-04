import { Flex, useBreakpointValue, useColorModeValue } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { VaultMetadata } from '@/constants/vaults'
import { useAuthStatus } from '@/contexts/authStatusContext'
import { useChainId } from '@/hooks/network'
import { VaultAccountSnapshot2, VaultSnapshot2, useVaultPositionHistory } from '@/hooks/vaults2'
import { useVaults7dAccumulations } from '@/hooks/vaults2'
import { useBalances } from '@/hooks/wallet'
import { Big18Math } from '@/utils/big18Utils'
import { usePrevious } from '@/utils/hooks'

import colors from '@ds/theme/colors'

import { GeoBlockedMessage, VpnDetectedMessage } from '../../Trade/TradeForm/components/styles'
import MobileVaultSelect, { MobileSelectContainer } from '../VaultSelect/MobileVaultSelector'
import { useExposureAndFunding } from '../hooks'
import { useVaultDescription } from '../hooks'
import ClaimModal from './ClaimModal'
import LpWarningModal from './LpWarningModal'
import VaultForm from './VaultForm'
import {
  APRCard,
  CapactiyCard,
  ClaimCard,
  PositionCard,
  RiskCard,
  SupportedAssetsSection,
  VaultDetailTitle,
} from './components'
import { usePnl, usePositionSettledToast, useVaultDetailCopy } from './hooks'

export default function VaultDetail({
  vault,
  vaultAccountSnapshot,
}: {
  vault: VaultSnapshot2
  vaultAccountSnapshot?: VaultAccountSnapshot2
}) {
  const chainId = useChainId()
  const { data: positionHistory } = useVaultPositionHistory()

  const vaultAccumulations = useVaults7dAccumulations()
  const isBase = useBreakpointValue({ base: true, md: false })
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showLpModal, setShowLpModal] = useState(false)
  const vaultDescription = useVaultDescription()
  const { data: balances } = useBalances()
  const copy = useVaultDetailCopy()
  const { geoblocked, vpnDetected } = useAuthStatus()
  const {
    totalAssets,
    parameter: { cap: maxCollateral },
    vaultType,
  } = vault

  useEffect(() => {
    const lpWarningShown = localStorage.getItem(`${chainId}-lpWarning`)
    if (!lpWarningShown) {
      setShowLpModal(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exposureData = useExposureAndFunding({
    vault,
    accumulations: vaultAccumulations.find((v) => v.data?.vaultAddress === vault.vault)?.data,
  })
  const pnl = usePnl({ vault, vaultAccountSnapshot, vaultPositionHistory: positionHistory?.[vault.vaultType] })

  const alpha5 = useColorModeValue(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])
  const metadata = VaultMetadata[chainId]?.[vaultType]
  const vaultName = metadata?.name ?? vault.name
  const prevVaultName = usePrevious(vaultName)
  const hasClaimable = !Big18Math.isZero(vaultAccountSnapshot?.accountData.assets ?? 0n)
  const hasPendingRedemptions = !Big18Math.isZero(vaultAccountSnapshot?.accountData.redemption ?? 0n)
  const positionUpdating = Boolean(
    vaultAccountSnapshot &&
      (!Big18Math.isZero(vaultAccountSnapshot.accountData.deposit) ||
        !Big18Math.isZero(vaultAccountSnapshot.accountData.redemption)),
  )
  const prevPositionUpdating = usePrevious(positionUpdating)

  usePositionSettledToast({ vaultName, prevVaultName, prevPositionUpdating, positionUpdating, copy })

  const showClaimCard = vaultAccountSnapshot && (hasClaimable || hasPendingRedemptions)

  return (
    <>
      {showClaimModal && vaultAccountSnapshot && (
        <ClaimModal
          onClose={() => setShowClaimModal(false)}
          vaultName={vaultName}
          vaultSnapshot={vault}
          vaultUserSnapshot={vaultAccountSnapshot}
        />
      )}
      {showLpModal && <LpWarningModal onClose={() => setShowLpModal(false)} />}
      <Flex height="100%" width="100%" pt={10} px={{ base: 6, sm: 14 }} bg={alpha5}>
        <Flex flexDirection="column" mr={isBase ? 0 : 9} width={isBase ? '100%' : '50%'}>
          <MobileSelectContainer>
            <MobileVaultSelect />
          </MobileSelectContainer>
          <VaultDetailTitle name={vaultName} description={vaultDescription[vaultType]} />
          <SupportedAssetsSection supportedAssets={vault.assets} />
          {isBase && (
            <>
              {geoblocked && <GeoBlockedMessage mb="22px" />}
              {vpnDetected && <VpnDetectedMessage mb="22px" />}
              {showClaimCard && (
                <ClaimCard
                  setShowClaimModal={setShowClaimModal}
                  vaultUserSnapshot={vaultAccountSnapshot}
                  vaultSnapshot={vault}
                  vaultName={vaultName}
                />
              )}
              <PositionCard vaultUserSnapshot={vaultAccountSnapshot} pnl={pnl} positionUpdating={positionUpdating} />
              <VaultForm
                vaultSnapshot={vault}
                vaultName={vaultName}
                vaultUserSnapshot={vaultAccountSnapshot}
                balances={balances}
              />
            </>
          )}
          <APRCard feeAPR={exposureData?.totalFeeAPR ?? 0n} fundingAPR={exposureData?.totalFundingAPR ?? 0n} />
          <RiskCard
            exposure={exposureData?.exposure}
            isLong={exposureData?.isLongExposure}
            totalWeight={exposureData?.totalWeight}
            marketExposures={exposureData?.marketExposures}
          />
          <CapactiyCard collateral={totalAssets} capacity={maxCollateral} />
        </Flex>
        {!isBase && (
          <Flex flexDirection="column" width="50%" pt={7}>
            {geoblocked && <GeoBlockedMessage mb="22px" />}
            {vpnDetected && <VpnDetectedMessage mb="22px" />}
            {showClaimCard && (
              <ClaimCard
                setShowClaimModal={setShowClaimModal}
                vaultSnapshot={vault}
                vaultName={vaultName}
                vaultUserSnapshot={vaultAccountSnapshot}
              />
            )}
            <PositionCard vaultUserSnapshot={vaultAccountSnapshot} pnl={pnl} positionUpdating={positionUpdating} />
            <VaultForm
              vaultSnapshot={vault}
              vaultName={vaultName}
              vaultUserSnapshot={vaultAccountSnapshot}
              balances={balances}
            />
          </Flex>
        )}
      </Flex>
    </>
  )
}
