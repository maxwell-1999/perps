import { Flex, Text, usePrevious } from '@chakra-ui/react'
import { useState } from 'react'

import { PerennialVaultType } from '@/constants/vaults'
import { useMigrationContext } from '@/contexts/migrationContext'
import { Big18Math, formatBig18USDPrice } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { BalanceCard, MigrationInstructions } from '.'
import { EmptyStateView } from '../constants'
import { useEmtpyStateCopy, useV1Balances, useV1VaultSettledToast } from '../hooks'
import ClaimModal from './ClaimModal'
import RedeemModal from './RedeemModal'

interface MigrationProps {
  setView: (view: EmptyStateView) => void
}

export default function Migration({ setView }: MigrationProps) {
  const {
    selectedVault,
    v1VaultMetadata,
    vaultsWithBalances: vaultUserSnapshots,
    selectedVaultSnapshot,
    selectedVaultUserSnapshot,
    withdrawnAmount,
    setSelectedVault,
  } = useMigrationContext()
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false)
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false)
  const prevVaultUserSnapshot = usePrevious(selectedVaultUserSnapshot)
  const prevSelectedVault = usePrevious(selectedVault)
  const copy = useEmtpyStateCopy()
  const { data: balances } = useV1Balances()

  useV1VaultSettledToast({
    prevSelectedVault,
    prevVaultUserSnapshot,
    selectedVault,
    vaultUserSnapshot: selectedVaultUserSnapshot,
  })

  if (!selectedVault || !selectedVaultSnapshot || !selectedVaultUserSnapshot || !balances) return null

  const pendingRedemption = Boolean(
    selectedVaultUserSnapshot && !Big18Math.isZero(selectedVaultUserSnapshot.pendingRedemptionAmount),
  )
  const canRedeem = !!balances && selectedVaultUserSnapshot.assets > Big18Math.fromFloatString('0.1')
  const canClaim = !Big18Math.isZero(selectedVaultUserSnapshot?.claimable ?? 0n)
  const selectedVaultName = v1VaultMetadata?.[selectedVault]?.name ?? selectedVault
  const white50 = colors.brand.whiteAlpha[50]

  return (
    <>
      <Flex minHeight="100%" width="100%" p={{ base: 10, lg: 14 }} px={{ base: 14, lg: 20 }} flexDirection="column">
        <Flex flexDirection="column" mb={5}>
          <Flex mb={2} width="100%" justifyContent="space-between" alignItems="center">
            <Text fontSize="26px">{copy.executeMigrations}</Text>
            <Button variant="transparent" label={copy.cancel} onClick={() => setView(EmptyStateView.earnWithVaults)} />
          </Flex>
          <Text color={white50} width="80%" mb={2}>
            {copy.migrationSubheader}
          </Text>
          {withdrawnAmount > 0n && (
            <Flex justifyContent="flex-start" width="fit-content">
              <Text color={colors.brand.whiteAlpha[50]} mr={2}>
                {copy.availableForDeposit}
              </Text>
              <Text color={colors.brand.green}>{formatBig18USDPrice(withdrawnAmount)}</Text>
            </Flex>
          )}
        </Flex>
        {vaultUserSnapshots.length > 0 && (
          <>
            <Text fontSize="13px" color={white50} mb={1}>
              {copy.positions}
            </Text>
            <Flex gap={6} mb={8} flexDirection={{ base: 'column', lg: 'row' }}>
              {vaultUserSnapshots.map((snapshotEntry) => {
                return (
                  <BalanceCard
                    key={snapshotEntry[0]}
                    snapshotEntry={snapshotEntry}
                    onClick={() => setSelectedVault(snapshotEntry[0] as PerennialVaultType)}
                    isSelected={snapshotEntry[0] === selectedVault}
                  />
                )
              })}
            </Flex>
          </>
        )}
        <MigrationInstructions
          onRedeem={() => setShowRedeemModal(true)}
          redeemDisabled={pendingRedemption || !canRedeem}
          onClaim={() => setShowClaimModal(true)}
          claimDisabled={!canClaim}
          positionUpdating={pendingRedemption}
        />
      </Flex>
      {showRedeemModal && canRedeem && (
        <RedeemModal
          onClose={() => {
            setShowRedeemModal(false)
          }}
          vaultSnapshot={selectedVaultSnapshot}
          sharesAllowance={balances.sharesAllowance}
          vaultUserSnapshot={selectedVaultUserSnapshot}
          vaultName={selectedVaultName}
        />
      )}
      {showClaimModal && canClaim && (
        <ClaimModal
          dsuAllowance={balances?.dsuAllowance}
          onClose={() => setShowClaimModal(false)}
          vaultUserSnapshot={selectedVaultUserSnapshot}
          vaultName={selectedVaultName}
          vaultSnapshot={selectedVaultSnapshot}
        />
      )}
    </>
  )
}
