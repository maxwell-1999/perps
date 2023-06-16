import { Box, Flex, Spinner, Text, useColorModeValue } from '@chakra-ui/react'
import DownArrow from '@public/icons/downArrow.svg'

import { FeeApr, VaultMetadata } from '@/constants/vaults'
import { useVaultContext } from '@/contexts/vaultContext'
import { useChainId } from '@/hooks/network'
import { formatBig18 } from '@/utils/big18Utils'

import colors from '@ds/theme/colors'

import VaultCard from './VaultCard'
import { fadeIn } from './VaultCard/styles'
import { useVaultSelectCopy } from './hooks'

export default function VaultSelect() {
  const copy = useVaultSelectCopy()
  const borderColor = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  const titleSpanColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const chainId = useChainId()
  const { vaultSnapshots, status } = useVaultContext()
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
            vaultSnapshots.map((snapshot, i) => {
              const metadata = VaultMetadata[chainId][snapshot.symbol]
              if (!metadata) return null
              const feeRate = FeeApr[chainId][snapshot.symbol] ?? 0n
              const feeAPR = formatBig18(feeRate * 100n, { numSigFigs: 4, minDecimals: 2 })
              return (
                <Box
                  opacity={0}
                  animation={`${fadeIn} 0.1s ease forwards ${i * 0.1}s`}
                  key={`animate-${snapshot.address}`}
                >
                  <VaultCard
                    key={snapshot.address}
                    apy={feeAPR}
                    name={metadata.name}
                    assets={metadata.assets}
                    description="Some description of the vault can go here to let people know why they should deposit"
                    collateral={snapshot.totalAssets}
                    capacity={snapshot.maxCollateral}
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
