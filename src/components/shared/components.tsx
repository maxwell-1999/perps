import { Flex, FlexProps, Text } from '@chakra-ui/react'
import Image from 'next/image'

import { AssetMetadata, SupportedAsset } from '@/constants/assets'

interface Props extends FlexProps {
  market: AssetMetadata[SupportedAsset]
  text?: string
  fontSize?: string
}

export const AssetIconWithText: React.FC<Props> = ({ market, text, fontSize = '16px', ...props }) => (
  <Flex alignItems="center" {...props}>
    <Image src={market.icon} height={25} width={25} alt={market.name} />
    <Text ml={2} fontSize={fontSize}>
      {text ? text : market.symbol}
    </Text>
  </Flex>
)
