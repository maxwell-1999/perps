import { ArrowBackIcon, InfoIcon } from '@chakra-ui/icons'
import { Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react'

import colors from '@ds/theme/colors'

import { useVaultDetailCopy } from './hooks'

const Feature = ({ title, description, isLast }: { title: string; description: string; isLast?: boolean }) => {
  const alpha70 = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])
  return (
    <Flex alignItems="center" mb={isLast ? 0 : '18px'}>
      <Flex mr={3}>
        <InfoIcon height="40px" width="40px" />
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

export default function VaultEmptyState() {
  const copy = useVaultDetailCopy()
  const alpha40 = useColorModeValue(colors.brand.blackAlpha[40], colors.brand.whiteAlpha[40])
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const alpha80 = useColorModeValue(colors.brand.blackAlpha[80], colors.brand.whiteAlpha[80])

  return (
    <Flex height="100%" width="100%" p={5} justifyContent="center" alignItems="center">
      <Flex flexDirection="column" maxWidth="400px">
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
          <Feature title={copy.featureTitle} description={copy.featureDescription} />
          <Feature title={copy.featureTitle} description={copy.featureDescription} />
          <Feature title={copy.featureTitle} description={copy.featureDescription} isLast />
        </Flex>
        <Text fontSize="13px" color={alpha50} mb={4}>
          {copy.liquidityDisclaimer}
        </Text>
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
