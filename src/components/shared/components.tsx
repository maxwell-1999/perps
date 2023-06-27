import { Flex, FlexProps, Spinner, Text, TextProps } from '@chakra-ui/react'
import styled from '@emotion/styled'
import Image from 'next/image'

import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { formatBig18, formatBig18USDPrice } from '@/utils/big18Utils'

interface AssetIconWithTextProps extends FlexProps {
  market: AssetMetadata[SupportedAsset]
  text?: string | React.ReactNode
  textProps?: TextProps
  size?: 'sm' | 'md'
}

export const AssetIconWithText: React.FC<AssetIconWithTextProps> = ({ market, text, size, textProps, ...props }) => (
  <Flex alignItems="center" {...props}>
    <Image src={market.icon} height={size === 'sm' ? 16 : 25} width={size === 'sm' ? 16 : 25} alt={market.name} />
    <Text ml={2} fontSize="16px" {...textProps}>
      {text ? text : market.symbol}
    </Text>
  </Flex>
)

interface FormattedBig18Props extends TextProps {
  value: bigint
  asset?: SupportedAsset
  leverage?: boolean
}
export const FormattedBig18: React.FC<FormattedBig18Props> = ({ value, asset, leverage, ...props }) => (
  <Text {...props}>
    {formatBig18(value)}
    {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
    {asset ? ' ' + AssetMetadata[asset].baseCurrency.toUpperCase() : null}
    {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
    {leverage ? 'x' : null}
  </Text>
)

interface FormattedBig18USDPriceProps extends TextProps {
  value: bigint
  compact?: boolean
}
export const FormattedBig18USDPrice: React.FC<FormattedBig18USDPriceProps> = ({ value, compact, ...props }) => (
  <Text {...props}>{formatBig18USDPrice(value, { compact: Boolean(compact) })}</Text>
)

export const Form = styled('form')`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

export const LoadingScreen = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  return (
    <Flex width="100%" height="100%" justifyContent="center" alignItems="center">
      <Spinner size={size} />
    </Flex>
  )
}
