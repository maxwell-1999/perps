import { Flex, Progress, Text, useColorModeValue } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import colors from '@/components/design-system/theme/colors'
import { AssetIconWithText } from '@/components/shared/components'
import { FormattedBig18USDPrice } from '@/components/shared/components'
import { AssetMetadata, SupportedAsset } from '@/constants/assets'

import { Container } from '@ds/Container'

import { useVaultSelectCopy } from '../hooks'
import { CapacityRow, DescriptionRow, TitleRow } from './styles'
import { formatValueForProgressBar } from './utils'

interface VaultCardProps {
  apy: string
  name: string
  asset: SupportedAsset
  description: string
  collateral: bigint
  capacity: bigint
}

export default function VaultCard({ name, asset, apy, description, collateral, capacity }: VaultCardProps) {
  const intl = useIntl()
  const copy = useVaultSelectCopy()
  const grayTextColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const descriptionTextColor = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])
  const borderColor = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  const cardBorder = `1px solid ${borderColor}`
  // placeholder apy
  const apyPercent = intl.formatMessage({ defaultMessage: '{apy}%' }, { apy })
  const progressbarCollateral = formatValueForProgressBar(collateral, capacity)
  const progressPercent = intl.formatMessage({ defaultMessage: '{progressbarCollateral}%' }, { progressbarCollateral })

  return (
    <Container variant="vaultCard" flexDirection="column" mb={5}>
      <TitleRow borderBottom={cardBorder}>
        <Flex flexDirection="column" borderRight={cardBorder} flex={1} height="100%" justifyContent="center">
          <Text fontSize="20px">{name}</Text>
          <AssetIconWithText
            market={AssetMetadata[asset]}
            text={asset.toUpperCase()}
            size="sm"
            textProps={{ fontSize: '14px', color: grayTextColor, fontWeight: 'bold' }}
          />
        </Flex>
        <Flex flexDirection="column" height="100%" justifyContent="center" alignItems="flex-end" pl={4}>
          <Text fontSize="20px" color={colors.brand.green}>
            {apyPercent}
          </Text>
          <Text fontSize={'14px'} color={grayTextColor}>
            {copy.apy}
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
          <FormattedBig18USDPrice value={collateral} fontSize="12px" fontWeight={500} />
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
