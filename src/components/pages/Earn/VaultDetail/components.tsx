import { Flex, Text, useColorModeValue } from '@chakra-ui/react'

import colors from '@/components/design-system/theme/colors'
import { AssetIconWithText } from '@/components/shared/components'
import { AssetMetadata, SupportedAsset } from '@/constants/assets'

import { Container } from '@ds/Container'

import { useVaultDetailCopy } from './hooks'

export const VaultDetailTitle = ({ name, description }: { name: string; description: string }) => {
  const copy = useVaultDetailCopy()
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const alpha70 = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])

  return (
    <Flex flexDirection="column" mb="22px">
      <Text fontSize="14px" mb={1} color={alpha50}>
        {copy.viewing}
      </Text>
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
      <Text color={alpha50}>{copy.assetsSupported}</Text>
      <Flex>
        {supportedAssets.map((asset, i) => (
          <AssetIconWithText
            key={asset}
            market={AssetMetadata[asset]}
            text={asset.toUpperCase()}
            textProps={{ fontSize: '18px' }}
            mr={i !== supportedAssets.length - 1 ? 6 : 0}
          />
        ))}
      </Flex>
    </Flex>
  )
}

export const RiskCard = () => {
  const copy = useVaultDetailCopy()
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const alpha20 = useColorModeValue(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])

  return (
    <Container p={4} variant="vaultCard" justifyContent="space-between">
      <Flex justifyContent="space-between" borderRight={`1px solid ${alpha20}`}>
        <Text color={alpha50}>{copy.riskExposure}</Text>
      </Flex>
    </Container>
  )
}
