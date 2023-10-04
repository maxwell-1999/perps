import { ArrowForwardIcon, InfoIcon } from '@chakra-ui/icons'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { Flex, Heading, Spinner, Text, useColorModeValue } from '@chakra-ui/react'
import AutonomousIcon from '@public/icons/autonomous.svg'
import EfficientIcon from '@public/icons/efficient.svg'
import HedgedIcon from '@public/icons/hedged.svg'
import Link from 'next/link'
import { ObjectEntry } from 'type-fest/source/entry'

import { Button, Container } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import { AssetIconWithText, FormattedBig18USDPrice } from '@/components/shared/components'
import { AssetMetadata } from '@/constants/markets'
import { VaultMetadataV1 } from '@/constants/vaults'
import { useMigrationContext } from '@/contexts/migrationContext'
import { useChainId } from '@/hooks/network'
import { VaultUserSnapshot } from '@/hooks/vaults'
import { Big18Math } from '@/utils/big18Utils'

import MobileVaultSelect, { MobileSelectContainer } from '../../../VaultSelect/MobileVaultSelector'
import { useVaultDetailCopy } from '../../hooks'
import { EmptyStateView } from '../constants'
import { useEmtpyStateCopy } from '../hooks'

interface MigrationBannerProps {
  onClick: () => void
}

export const MigrationBanner = ({ onClick }: MigrationBannerProps) => {
  const copy = useEmtpyStateCopy()
  return (
    <Container
      onClick={onClick}
      p={4}
      borderRadius="9px"
      border={`1px solid ${colors.brand.purple[250]}`}
      mb={4}
      cursor="pointer"
      gap={2}
      background={colors.brand.whiteAlpha[10]}
      _hover={{
        background: colors.brand.whiteAlpha[15],
      }}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="17px" fontWeight={600}>
          {copy.title1}
          <Text as="span" ml={1} color={colors.brand.whiteAlpha[50]}>
            {copy.title2}
          </Text>
        </Text>
        <ArrowForwardIcon ml={2} color={'white'} stroke="3px" />
      </Flex>
      <Flex>
        <Text fontSize="13px" color={colors.brand.whiteAlpha[50]}>
          {copy.body}
        </Text>
      </Flex>
    </Container>
  )
}

export const Feature = ({
  title,
  description,
  isLast,
  icon,
}: {
  title: string
  description: string
  isLast?: boolean
  icon?: React.ReactNode
}) => {
  const alpha70 = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])
  return (
    <Flex alignItems="center" mb={isLast ? 0 : '18px'}>
      <Flex mr={3}>
        {icon ? (
          <Flex
            height="40px"
            width="40px"
            bg={colors.brand.whiteAlpha[10]}
            borderRadius="50%"
            justifyContent="center"
            alignItems="center"
          >
            {icon}
          </Flex>
        ) : (
          <InfoIcon height="40px" width="40px" />
        )}
      </Flex>
      <Flex flexDirection="column" justifyContent="center">
        <Text fontWeight={500}>{title}</Text>
        <Text fontWeight={500} fontSize="12px" color={alpha70}>
          {description}
        </Text>
      </Flex>
    </Flex>
  )
}

export function EarnWithVaults({ setView }: { setView: (view: EmptyStateView) => void }) {
  const { vaultsWithBalances: vaultUserSnapshots } = useMigrationContext()
  const copy = useVaultDetailCopy()
  const alpha40 = useColorModeValue(colors.brand.blackAlpha[40], colors.brand.whiteAlpha[40])
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const alpha80 = useColorModeValue(colors.brand.blackAlpha[80], colors.brand.whiteAlpha[80])

  return (
    <Flex height="100%" width="100%" p={5} justifyContent="center" alignItems="center">
      <Flex flexDirection="column" maxWidth="400px">
        <MobileSelectContainer>
          <MobileVaultSelect />
        </MobileSelectContainer>
        {vaultUserSnapshots && vaultUserSnapshots?.length > 0 && (
          <MigrationBanner onClick={() => setView(EmptyStateView.migrate)} />
        )}
        <Heading mb={2} fontWeight={500} fontSize="30px">
          <Text as="span" mr={2} color={alpha50}>
            {copy.earnWith}
          </Text>
          {copy.vaults}
        </Heading>

        <Text color={alpha80} fontWeight={500} mb={4}>
          {copy.emptyStateSubhead}
        </Text>
        <Flex flexDirection="column" mb={4}>
          <Feature title={copy.autonomous} description={copy.autonomousBody} icon={<AutonomousIcon />} />
          <Feature title={copy.deltaHedged} description={copy.deltaHedgedBody} icon={<HedgedIcon />} />
          <Feature
            title={copy.capitalEfficient}
            description={copy.capitalEfficientBody}
            isLast
            icon={<EfficientIcon />}
          />
        </Flex>
        <Text fontSize="13px" color={alpha50} mb={4}>
          {copy.liquidityDisclaimer}
        </Text>
        <Link href="https://docs.perennial.finance/protocol-design/vaults" target="_blank">
          <Text fontSize="13px" textDecoration="underline" mb={4} _hover={{ color: colors.brand.whiteAlpha[80] }}>
            {copy.readTheDocs}
          </Text>
        </Link>
        <Flex alignItems="center" border={`1px solid ${alpha40}`} p={2} borderRadius="6px" alignSelf="flex-start">
          <ArrowBackIcon color={alpha50} mr={2} />
          <Text fontSize="13px" color={alpha50}>
            {copy.selectVaultToContinue}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export const BalanceCard = ({
  snapshotEntry,
  onClick,
  isSelected,
}: {
  snapshotEntry: ObjectEntry<{ alpha?: VaultUserSnapshot; bravo?: VaultUserSnapshot }>
  onClick: () => void
  isSelected: boolean
}) => {
  const chainId = useChainId()
  const copy = useEmtpyStateCopy()
  const metadata = VaultMetadataV1[chainId]
  const [vaultName, vaultUserSnapshot] = snapshotEntry
  const vaultAssets = vaultUserSnapshot?.assets ?? 0n
  const pendingDeposits = vaultUserSnapshot?.pendingDepositAmount ?? 0n
  const pendingRedemptions = vaultUserSnapshot?.pendingRedemptionAmount ?? 0n
  const claimable = vaultUserSnapshot?.claimable ?? 0n
  const positionAmount = Big18Math.sub(Big18Math.add(vaultAssets, pendingDeposits), pendingRedemptions)
  const assets = metadata?.[vaultName]?.assets ?? []

  return (
    <Container
      key={vaultName}
      maxWidth={{ base: '100%', lg: '50%' }}
      p={5}
      onClick={onClick}
      borderColor={isSelected ? colors.brand.whiteAlpha[50] : colors.brand.whiteAlpha[10]}
      _hover={{
        borderColor: isSelected ? colors.brand.whiteAlpha[50] : colors.brand.whiteAlpha[30],
      }}
      cursor="pointer"
    >
      <Flex justifyContent="space-between">
        <Flex flexDirection="column">
          <Text fontSize="20px" textTransform="capitalize" mb={2}>
            {metadata?.[vaultName]?.name ?? vaultName}
          </Text>
          <Flex>
            <Text color={colors.brand.whiteAlpha[50]} mr={2}>
              {copy.balance}
            </Text>
            <FormattedBig18USDPrice
              value={positionAmount > Big18Math.fromFloatString('0.1') ? positionAmount : 0n}
              color={colors.brand.purple[240]}
            />
          </Flex>
          <Flex alignItems="center">
            <Text color={colors.brand.whiteAlpha[50]} mr={2}>
              {copy.claimable}
            </Text>
            {pendingRedemptions > 0n ? (
              <Spinner size="xs" color={colors.brand.whiteAlpha[50]} />
            ) : (
              <FormattedBig18USDPrice value={claimable} color={colors.brand.green} />
            )}
          </Flex>
        </Flex>
        {assets.map((asset) => (
          <AssetIconWithText
            key={asset}
            market={AssetMetadata[asset]}
            text={asset.toUpperCase()}
            textProps={{ color: colors.brand.whiteAlpha[50] }}
          />
        ))}
      </Flex>
    </Container>
  )
}

const Step = ({
  title,
  subtitle,
  rightEl,
  stepNumber,
}: {
  title: string
  subtitle?: string
  rightEl?: React.ReactNode
  stepNumber: string
}) => {
  return (
    <Flex alignItems="center" maxWidth="90%" py={2}>
      <Flex
        width="40px"
        height="40px"
        minWidth="40px"
        bg={colors.brand.whiteAlpha[10]}
        borderRadius="full"
        mr={4}
        alignItems="center"
        justifyContent="center"
      >
        <Flex height="20px" width="20px" alignItems="center" justifyContent="center">
          <Text fontWeight="600" color={colors.brand.green}>
            {stepNumber}
          </Text>
        </Flex>
      </Flex>
      <Flex width="100%" flexDirection={{ base: 'column', md: 'row' }}>
        <Flex flexDirection="column" mr="auto">
          <Text fontSize="18px">{title}</Text>
          {subtitle && (
            <Text fontSize="13px" color={colors.brand.whiteAlpha[50]}>
              {subtitle}
            </Text>
          )}
        </Flex>
        {rightEl && <Flex mt={{ base: 2, md: 0 }}>{rightEl}</Flex>}
      </Flex>
    </Flex>
  )
}

export const MigrationInstructions = ({
  onRedeem,
  redeemDisabled,
  onClaim,
  claimDisabled,
  positionUpdating,
}: {
  onRedeem: () => void
  redeemDisabled: boolean
  onClaim: () => void
  claimDisabled: boolean
  positionUpdating: boolean
}) => {
  const copy = useEmtpyStateCopy()
  const { withdrawnAmount } = useMigrationContext()
  return (
    <Flex flexDirection="column" gap={5}>
      <Flex flexDirection="column" gap={2}>
        <Step
          stepNumber="1"
          title={copy.migrationStep1}
          subtitle={copy.step1Subheader}
          rightEl={
            <Button variant="transparent" isDisabled={redeemDisabled} label={copy.redeemFunds} onClick={onRedeem} />
          }
        />
        <Step
          stepNumber="2"
          title={copy.migrationStep2}
          subtitle={copy.step2Subheader}
          rightEl={
            <Button
              variant="transparent"
              isDisabled={claimDisabled}
              label={copy.claimFunds}
              onClick={onClaim}
              isLoading={positionUpdating}
            />
          }
        />
        <Step
          stepNumber="3"
          title={copy.migrationStep3}
          subtitle={copy.step3Subheader}
          rightEl={
            <>{withdrawnAmount > 0n && <MobileVaultSelect height="40px" isDisabled={withdrawnAmount <= 0n} />}</>
          }
        />
      </Flex>
    </Flex>
  )
}
