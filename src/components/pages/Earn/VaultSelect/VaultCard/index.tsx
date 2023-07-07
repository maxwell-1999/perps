import { Flex, Progress, Text, useColorModeValue } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import colors from '@/components/design-system/theme/colors'
import { AssetIconWithText } from '@/components/shared/components'
import { FormattedBig18USDPrice } from '@/components/shared/components'
import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { VaultSnapshot } from '@/hooks/vaults'
import { formatBig18 } from '@/utils/big18Utils'

import { Container } from '@ds/Container'

import { useExposureAndFunding } from '../../hooks'
import { formatValueForProgressBar } from '../../utils'
import { useVaultSelectCopy } from '../hooks'
import { CapacityRow, DescriptionRow, TitleRow } from './styles'

interface VaultCardProps {
  feeAPR: bigint
  name: string
  assets: SupportedAsset[]
  vault: VaultSnapshot
  description: string
  onClick: () => void
}

export default function VaultCard({ name, assets, description, vault, feeAPR, onClick }: VaultCardProps) {
  const intl = useIntl()
  const copy = useVaultSelectCopy()
  const grayTextColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const descriptionTextColor = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])
  const borderColor = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  const hoverBorderColor = useColorModeValue(colors.brand.blackAlpha[40], colors.brand.whiteAlpha[40])
  const cardBorder = `1px solid ${borderColor}`

  const exposureAndFunding = useExposureAndFunding({ vault })
  const apr = formatBig18((feeAPR + (exposureAndFunding?.totalFundingAPR ?? 0n)) * 100n, {
    numSigFigs: 4,
    minDecimals: 2,
  })
  const aprPercent = intl.formatMessage({ defaultMessage: '{apr}%' }, { apr })

  const progressbarCollateral = formatValueForProgressBar(vault.totalAssets, vault.maxCollateral)
  const progressPercent = intl.formatMessage({ defaultMessage: '{progressbarCollateral}%' }, { progressbarCollateral })

  return (
    <Container
      variant="vaultCard"
      flexDirection="column"
      mb={5}
      _hover={{ border: `1px solid ${hoverBorderColor}` }}
      cursor="pointer"
      onClick={onClick}
    >
      <TitleRow borderBottom={cardBorder}>
        <Flex
          flexDirection="column"
          borderRight={cardBorder}
          flex={1}
          height="100%"
          justifyContent="center"
          py={2}
          pr={1}
          width="59px"
        >
          <Text fontSize={name.length > 10 ? '16px' : '20px'}>{name}</Text>
          <Flex overflowX="auto">
            {assets.map((asset) => (
              <AssetIconWithText
                key={asset}
                market={AssetMetadata[asset]}
                text={asset.toUpperCase()}
                size="sm"
                textProps={{ fontSize: '14px', color: grayTextColor, fontWeight: 'bold' }}
                mr={6}
              />
            ))}
          </Flex>
        </Flex>
        <Flex flexDirection="column" height="100%" justifyContent="center" alignItems="flex-end" pl={3}>
          <Text fontSize="20px" color={colors.brand.green}>
            {aprPercent}
          </Text>
          <Text fontSize={'14px'} color={grayTextColor}>
            {copy.apr}
          </Text>
        </Flex>
      </TitleRow>
      <DescriptionRow borderBottom={cardBorder}>
        <Text fontSize="14px" color={descriptionTextColor}>
          {description}
        </Text>
      </DescriptionRow>
      <CapacityRow>
        <Progress value={progressbarCollateral} width="100%" size="sm" mb={2} />
        <Flex justifyContent="space-between" width="100%">
          <FormattedBig18USDPrice value={vault.totalAssets} fontSize="12px" fontWeight={500} />
          <Text fontSize="12px" fontWeight={500} color={grayTextColor}>
            <Text as="span" mr={1} color={descriptionTextColor}>
              {progressPercent}
            </Text>
            {copy.ofCapacity}
          </Text>
        </Flex>
      </CapacityRow>
    </Container>
  )
}
