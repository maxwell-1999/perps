import { ArrowBackIcon } from '@chakra-ui/icons'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Divider,
  Flex,
  Progress,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { IconButton } from '@/components/design-system/Button'
import { TooltipIcon } from '@/components/design-system/Tooltip'
import colors from '@/components/design-system/theme/colors'
import { TxButton } from '@/components/shared/TxButton'
import { AssetIconWithText, FormattedBig6Percent, FormattedBig6USDPrice } from '@/components/shared/components'
import { AssetMetadata, SupportedAsset } from '@/constants/markets'
import { MaxUint256 } from '@/constants/units'
import { useVaultContext } from '@/contexts/vaultContext'
import { useAddress } from '@/hooks/network'
import { VaultAccountSnapshot2, VaultSnapshot2 } from '@/hooks/vaults2'
import { Big6Math, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'

import { Container } from '@ds/Container'

import { formatValueForProgressBar } from '../utils'
import { useVaultDetailCopy } from './hooks'

export const VaultDetailTitle = ({ name, description }: { name: string; description: string }) => {
  const copy = useVaultDetailCopy()
  const { setSelectedVault } = useVaultContext()
  const alpha70 = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])

  return (
    <Flex flexDirection="column" mb="22px">
      <IconButton
        aria-label={copy.back}
        icon={<ArrowBackIcon />}
        onClick={() => setSelectedVault()}
        height="30px"
        width="30px"
        border={`1px solid ${colors.brand.whiteAlpha[20]}`}
        mb={2}
      />
      <Text fontSize="30px" mb={1}>
        {name}
      </Text>
      <Text color={alpha70}>{description}</Text>
    </Flex>
  )
}

export const SupportedAssetsSection = ({ supportedAssets }: { supportedAssets: SupportedAsset[] }) => {
  const copy = useVaultDetailCopy()
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])

  return (
    <Flex alignItems="center" justifyContent="space-between" mb="22px">
      <Text color={alpha50}>{copy.marketsSupported}</Text>
      <Flex>
        {supportedAssets.map((asset, i) => (
          <AssetIconWithText
            key={asset}
            market={AssetMetadata[asset]}
            text={asset.toUpperCase()}
            textProps={{ fontSize: '18px' }}
            mr={i !== supportedAssets.length - 1 ? 4 : 0}
          />
        ))}
      </Flex>
    </Flex>
  )
}

export const RiskCard = ({
  exposure,
  isLong,
  totalWeight,
  marketExposures,
}: {
  exposure?: number
  isLong?: boolean
  totalWeight?: bigint
  marketExposures?: { exposurePct: number; asset?: SupportedAsset; weight: bigint }[]
}) => {
  const intl = useIntl()
  const copy = useVaultDetailCopy()
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const alpha60 = useColorModeValue(colors.brand.blackAlpha[60], colors.brand.whiteAlpha[60])
  const alpha20 = useColorModeValue(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])

  if (exposure === undefined) {
    return (
      <Container p={4} variant="vaultCard" justifyContent="center" mb="22px" flexDirection="row">
        <Spinner size="sm" />
      </Container>
    )
  }

  const exposurePercent = intl.formatMessage({ defaultMessage: '{exposure}%' }, { exposure: exposure.toFixed(5) })
  const exposureColor = isLong ? colors.brand.green : colors.brand.red
  const label = isLong ? copy.long : copy.short
  return (
    <Container p={4} variant="vaultCard" justifyContent="space-between" mb="22px" flexDirection="row">
      <Accordion allowToggle w="100%" p={0}>
        <AccordionItem border="none">
          <AccordionButton
            paddingX={0}
            _expanded={{ borderBottom: `1px solid ${alpha20}`, paddingBottom: 3, marginBottom: 2 }}
          >
            <Flex justifyContent="space-between" borderRight={`1px solid ${alpha20}`} pr={2} mr={2} flex={1} gap={2}>
              <Flex alignItems="center" gap={2}>
                <Text color={alpha50}>{copy.currentExposure}</Text>
                <TooltipIcon color={alpha50} tooltipText={copy.currentExposureTooltip} />
              </Flex>
              <Text color={exposureColor}>{exposurePercent}</Text>
            </Flex>
            <Text color={alpha60} mr={2}>
              {label}
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel paddingX={0}>
            <Flex flexDirection="column" gap={6}>
              {marketExposures?.map(({ exposurePct, asset, weight }) => (
                <Flex flexDirection="row" key={asset}>
                  <Flex justifyContent="space-between" borderRight={`1px solid ${alpha20}`} pr={2} mr={2} flex={1}>
                    <Flex gap={2} alignItems="center">
                      {asset && (
                        <AssetIconWithText key={asset} market={AssetMetadata[asset]} text={AssetMetadata[asset].name} />
                      )}
                      {totalWeight && totalWeight > 0n ? (
                        // eslint-disable-next-line formatjs/no-literal-string-in-jsx
                        <Text color={alpha60}>({formatBig6Percent(Big6Math.div(weight, totalWeight))})</Text>
                      ) : undefined}
                    </Flex>
                    <Text color={exposurePct >= 0 ? colors.brand.green : colors.brand.red}>
                      {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                      {Math.abs(exposurePct).toFixed(5)}%
                    </Text>
                  </Flex>
                  <Text color={alpha60}>{exposurePct > 0 ? copy.long : copy.short}</Text>
                </Flex>
              ))}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Container>
  )
}

export const CapactiyCard = ({ collateral, capacity }: { collateral: bigint; capacity: bigint }) => {
  const copy = useVaultDetailCopy()
  const intl = useIntl()
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const isInfiniteCapacity = Big6Math.eq(capacity, MaxUint256)
  const progressbarCollateral = formatValueForProgressBar(collateral, capacity)
  const remainder = isInfiniteCapacity ? 100 : 100 - progressbarCollateral
  const progressPercent = intl.formatMessage({ defaultMessage: '{progressbarCollateral}%' }, { progressbarCollateral })
  const remainingPercent = intl.formatMessage({ defaultMessage: '{remainder}% left' }, { remainder })

  return (
    <Container p={4} variant="vaultCard" flexDirection="column" mb="22px">
      <Flex justifyContent="space-between" mb={3}>
        <Text fontSize="12px" color={alpha50}>
          {copy.deposited}
        </Text>
        <Text fontSize="12px" color={alpha50}>
          {copy.capacity}
        </Text>
      </Flex>
      <Progress value={progressbarCollateral} width="100%" mb={3} size="sm" />
      <Flex justifyContent="space-between">
        <FormattedBig6USDPrice value={collateral} fontSize="16px" fontWeight={500} compact />
        {isInfiniteCapacity ? (
          <Text size="16px">{copy.infinite}</Text>
        ) : (
          <FormattedBig6USDPrice value={capacity} fontSize="16px" fontWeight={500} compact />
        )}
      </Flex>
      <Flex justifyContent="space-between">
        <Text fontSize="12px" color={alpha50}>
          {progressPercent}
        </Text>
        <Text fontSize="12px" color={alpha50}>
          {remainingPercent}
        </Text>
      </Flex>
    </Container>
  )
}

export const PositionCard = ({
  vaultUserSnapshot,
  pnl,
  positionUpdating,
}: {
  vaultUserSnapshot?: VaultAccountSnapshot2
  pnl?: bigint
  positionUpdating: boolean
}) => {
  const copy = useVaultDetailCopy()
  const alpha5 = useColorModeValue(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])
  const alpha80 = useColorModeValue(colors.brand.blackAlpha[80], colors.brand.whiteAlpha[80])
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const updatingBgColor = useColorModeValue(colors.brand.whiteAlpha[50], colors.brand.blackAlpha[50])
  const pnlColor = pnl && pnl > 0n ? colors.brand.green : colors.brand.red
  const { address } = useAddress()
  if (address && !vaultUserSnapshot) {
    return (
      <Container
        p={4}
        variant="vaultCard"
        mb="22px"
        bg="transparent"
        alignItems="center"
        justifyContent="center"
        height="150px"
      >
        <Spinner size="sm" />
      </Container>
    )
  }

  const positionAmount = vaultUserSnapshot?.assets ?? 0n
  const hasPosition = vaultUserSnapshot && !Big6Math.isZero(positionAmount)

  return (
    <Container p={4} mb="22px" variant="vaultCard" bg={hasPosition ? alpha5 : 'transparent'}>
      <Flex flexDirection="column">
        <Text color={alpha80} fontSize="17px" mb={4}>
          {address && hasPosition ? copy.position : copy.noPositionToShow}
        </Text>
        <Flex flex={1} justifyContent="space-between" mb={4}>
          <Text color={alpha50}>{copy.value}</Text>
          {address && hasPosition ? (
            <FormattedBig6USDPrice value={positionAmount} fontSize="16px" fontWeight={500} />
          ) : (
            <Text color={alpha50}>{copy.noValue}</Text>
          )}
        </Flex>
        <Flex flex={1} justifyContent="space-between" mb={4}>
          <Text color={alpha50}>{copy.pnl}</Text>
          {positionUpdating ? (
            <Spinner size="sm" />
          ) : !pnl ? (
            <Text color={alpha50}>{copy.noValue}</Text>
          ) : (
            <FormattedBig6USDPrice value={pnl} fontSize="16px" fontWeight={500} color={pnlColor} />
          )}
        </Flex>
        {positionUpdating && (
          <Flex
            bg={updatingBgColor}
            flex={1}
            py={2}
            px={3}
            justifyContent="space-between"
            alignItems="center"
            borderRadius="6px"
          >
            <Spinner size="sm" color={colors.brand.green} />
            <Text variant="label" fontSize="14px">
              {copy.positionUpdating}
            </Text>
          </Flex>
        )}
      </Flex>
    </Container>
  )
}

export const ClaimCard = ({
  vaultUserSnapshot,
  vaultSnapshot,
  vaultName,
  setShowClaimModal,
}: {
  vaultUserSnapshot: VaultAccountSnapshot2
  vaultSnapshot: VaultSnapshot2
  vaultName: string
  setShowClaimModal: (show: boolean) => void
}) => {
  const {
    accountData: { redemption: pendingRedemption, assets: claimable },
  } = vaultUserSnapshot
  const { totalSettlementFee } = vaultSnapshot
  const intl = useIntl()
  const copy = useVaultDetailCopy()
  const alpha5 = useColorModeValue(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])
  const bg = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  const formattedClaimable = formatBig6USDPrice(claimable - totalSettlementFee)
  const isPending = !Big6Math.isZero(pendingRedemption)

  const bodyText = intl.formatMessage(
    {
      defaultMessage: 'Confirm your withdrawal of {formattedClaimable} from the {vaultName} vault.',
    },
    {
      formattedClaimable: (
        <Text as="span" color={colors.brand.green}>
          {formattedClaimable}
        </Text>
      ),
      vaultName,
    },
  )

  return (
    <Container p={4} mb="22px" variant="vaultCard" bg={alpha5}>
      <Flex flexDirection="column" gap={2}>
        <Text fontSize="16px">{isPending ? copy.withdrawPending : copy.yourWithdrawIsReady}</Text>
        <Text fontSize="14px" variant="label">
          {isPending ? copy.pendingWithdrawal : bodyText}
        </Text>
        <Flex>
          <TxButton
            width="100%"
            variant="outline"
            height="initial"
            p={2}
            bg={bg}
            onClick={() => setShowClaimModal(true)}
            label={
              <Text fontSize="14px">
                {copy.confirmWithdraw}
                {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                <Text as="span" fontFamily="Inter" ml={1}>
                  →
                </Text>
              </Text>
            }
            isLoading={isPending}
            loadingText={copy.confirmWithdraw}
            overrideLabel
            actionAllowedInGeoblock // allow claims in geoblock
            skipMarketFactoryApproval // not needed for claims
          />
        </Flex>
      </Flex>
    </Container>
  )
}

export const APRCard = ({ feeAPR, fundingAPR }: { feeAPR: bigint; fundingAPR: bigint }) => {
  const copy = useVaultDetailCopy()
  const alpha5 = useColorModeValue(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])

  return (
    <Container p={4} mb="22px" variant="vaultCard" bg={alpha5}>
      <Flex flexDirection="column" gap={4}>
        <Flex flex={1} justifyContent="space-between">
          <Text color={alpha50}>{copy.fundingFees}</Text>
          <FormattedBig6Percent value={fundingAPR} fontSize="16px" fontWeight={500} />
        </Flex>
        <Flex flex={1} justifyContent="space-between">
          <Text color={alpha50}>{copy.tradingFees}</Text>
          <FormattedBig6Percent value={feeAPR} fontSize="16px" fontWeight={500} />
        </Flex>
        <Divider />
        <Flex flex={1} justifyContent="space-between">
          <Flex alignItems="center" gap={2}>
            <Text color={alpha50}>{copy.totalAPR}</Text>
            <TooltipIcon color={alpha50} tooltipText={copy.vaultPnlTooltip} />
          </Flex>

          <FormattedBig6Percent
            color={colors.brand.green}
            value={feeAPR + fundingAPR}
            fontSize="16px"
            fontWeight={500}
          />
        </Flex>
      </Flex>
    </Container>
  )
}
