import { Flex, FlexProps, Spinner, Text, TextProps } from '@chakra-ui/react'
import styled from '@emotion/styled'
import Image from 'next/image'
import { useIntl } from 'react-intl'

import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'

import { TooltipText } from '../design-system/Tooltip'

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

interface FormattedBig18PercentProps extends TextProps {
  value: bigint
}
export const FormattedBig18Percent: React.FC<FormattedBig18PercentProps> = ({ value, ...props }) => (
  <Text {...props}>{formatBig18Percent(value)}</Text>
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

export const USDCETooltip = ({ userBalance }: { userBalance: string }) => {
  const intl = useIntl()
  const copy = {
    tooltipUSDCeOnly1: intl.formatMessage({
      defaultMessage: 'Perennial currently only supports',
    }),
    tooltipUSDCeOnly2: intl.formatMessage({
      defaultMessage: 'USDC.e (bridged USDC).',
    }),
    tooltipUSDCeOnly3: intl.formatMessage({
      defaultMessage: 'As of now',
    }),
    tooltipUSDCeOnly4: intl.formatMessage({
      defaultMessage: 'Native USDC',
    }),
    tooltipUSDCeOnly5: intl.formatMessage({
      defaultMessage: 'will not be recognized by the UI.',
    }),
  }

  return (
    <TooltipText
      variant="label"
      tooltipProps={{
        closeDelay: 2000,
      }}
      tooltipText={
        <Text as="span">
          {copy.tooltipUSDCeOnly1}
          <Text
            mx={1}
            textDecoration="underline"
            as="a"
            href="https://arbiscan.io/token/0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.tooltipUSDCeOnly2}
          </Text>
          {copy.tooltipUSDCeOnly3}
          <Text
            mx={1}
            textDecoration="underline"
            as="a"
            href="https://arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.tooltipUSDCeOnly4}
          </Text>
          {copy.tooltipUSDCeOnly5}
        </Text>
      }
    >
      {userBalance}
    </TooltipText>
  )
}
