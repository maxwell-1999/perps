import { Box, Flex, Spinner, Text, useColorModeValue } from '@chakra-ui/react'
import DownArrow from '@public/icons/downArrow.svg'

import { VaultMetadata } from '@/constants/vaults'
import { useVaultContext } from '@/contexts/vaultContext'
import { useChainId } from '@/hooks/network'

import colors from '@ds/theme/colors'

import { useVaultDescription } from '../hooks'
import VaultCard from './VaultCard'
import { fadeIn } from './VaultCard/styles'
import { useVaultSelectCopy } from './hooks'

export default function VaultSelect() {
  const chainId = useChainId()
  const copy = useVaultSelectCopy()
  const vaultDescription = useVaultDescription()
  const borderColor = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  const titleSpanColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const { status, setSelectedVault, vaultSnapshots, selectedVault } = useVaultContext()

  return (
    <Flex
      flexDirection="column"
      borderRight={`1px solid ${borderColor}`}
      height="calc(100vh - 86px)"
      overflowY="hidden"
    >
      <Flex overflowY="auto" pt="20px" pr="24px" pl="33px" flexDirection="column" height="100%">
        <Flex alignSelf="flex-start" justifyContent="space-between" width="100%" pb={1}>
          <Text>
            {copy.selectVault}
            <Text as="span" color={titleSpanColor} ml={1}>
              {copy.toViewDetails}
            </Text>
          </Text>
          <Flex alignItems="center">
            <DownArrow />
          </Flex>
        </Flex>
        <Flex flexDirection="column" pt={4} height="100%">
          {status !== 'success' ? (
            <Flex width="100%" height="100%" justifyContent="center" alignItems="center">
              <Spinner />
            </Flex>
          ) : (
            Object.values(vaultSnapshots?.vault ?? {}).map((vaultSnapshot, i) => {
              const { vaultType, vault } = vaultSnapshot
              const metadata = VaultMetadata[chainId]?.[vaultType]
              if (!metadata) return null
              return (
                <Box opacity={0} animation={`${fadeIn} 0.1s ease forwards ${i * 0.1}s`} key={`animate-${vault}`}>
                  <VaultCard
                    onClick={() => {
                      setSelectedVault(vaultType)
                    }}
                    vaultType={vaultType}
                    key={vault}
                    name={metadata.name}
                    assets={vaultSnapshot.assets}
                    description={vaultDescription[vaultType]}
                    vaultSnapshot={vaultSnapshot}
                    vaultAccountSnapshot={vaultSnapshots?.user?.[vaultType]}
                    isSelected={selectedVault === vaultType}
                  />
                </Box>
              )
            })
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
