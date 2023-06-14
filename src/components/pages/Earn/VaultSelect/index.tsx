import { Flex, Text, useColorModeValue } from '@chakra-ui/react'
import DownArrow from '@public/icons/downArrow.svg'

import { SupportedAsset } from '@/constants/assets'

import colors from '@ds/theme/colors'

import VaultCard from './VaultCard'
import { useVaultSelectCopy } from './hooks'

export default function VaultSelect() {
  const copy = useVaultSelectCopy()
  const borderColor = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  const titleSpanColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  return (
    <Flex
      flexDirection="column"
      borderRight={`1px solid ${borderColor}`}
      height="calc(100vh - 86px)"
      overflowY="hidden"
    >
      <Flex overflowY="auto" pt="20px" pr="24px" pl="33px" flexDirection="column">
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
        <Flex flexDirection="column" pt={4}>
          <VaultCard
            apy={'3.36'}
            name={'Blue Chip'}
            asset={SupportedAsset.eth}
            description="Some description of the vault can go here to let people know why they should deposit"
            collateral={1111230000000000000000n}
            capacity={3111230000000000000000n}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
