import { Flex, Text } from '@chakra-ui/react'
import Image from 'next/image'

import { AssetMetadata, SupportedAsset } from '@/constants/assets'

export const AssetIconWithText: React.FC<{
  market: AssetMetadata[SupportedAsset]
  text?: string
}> = ({ market, text }) => (
  <Flex alignItems="center">
    <Image src={market.icon} height={25} width={25} alt={market.name} />
    <Text ml={2} fontSize="16px">
      {text ? text : market.symbol}
    </Text>
  </Flex>
)
