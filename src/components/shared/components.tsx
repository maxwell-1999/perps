import { CloseIcon } from '@chakra-ui/icons'
import { Box, Flex, FlexProps, Spinner, Text, TextProps } from '@chakra-ui/react'
import styled from '@emotion/styled'
import Image from 'next/image'
import { useIntl } from 'react-intl'

import { AssetMetadata, SupportedAsset } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { formatBig6, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import { formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'

import { Container } from '../design-system'
import { TooltipText } from '../design-system/Tooltip'
import colors from '../design-system/theme/colors'
import { useAdjustmentModalCopy } from '../pages/Trade/TradeForm/components/AdjustPositionModal/hooks'

interface AssetIconWithTextProps extends FlexProps {
  market: AssetMetadata[SupportedAsset]
  text?: string | React.ReactNode
  textProps?: TextProps
  size?: 'sm' | 'md' | 'lg'
}

export const AssetIconWithText: React.FC<AssetIconWithTextProps> = ({
  market,
  text,
  size = 'lg',
  textProps,
  ...props
}) => {
  const imageSize = {
    sm: 16,
    md: 20,
    lg: 25,
  }

  const fontSize = {
    sm: '14px',
    md: '15px',
    lg: '16px',
  }
  return (
    <Flex alignItems="center" {...props}>
      <Image src={market.icon} height={imageSize[size]} width={imageSize[size]} alt={market.name} />
      <Text ml={2} fontSize={fontSize[size]} {...textProps}>
        {text ? text : market.symbol}
      </Text>
    </Flex>
  )
}

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

interface FormattedBig6Props extends TextProps {
  value: bigint
  asset?: SupportedAsset
  leverage?: boolean
}
export const FormattedBig6: React.FC<FormattedBig6Props> = ({ value, asset, leverage, ...props }) => (
  <Text {...props}>
    {formatBig6(value)}
    {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
    {asset ? ' ' + AssetMetadata[asset].baseCurrency.toUpperCase() : null}
    {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
    {leverage ? 'x' : null}
  </Text>
)

interface FormattedBig6USDPriceProps extends TextProps {
  value: bigint
  compact?: boolean
}
export const FormattedBig6USDPrice: React.FC<FormattedBig6USDPriceProps> = ({ value, compact, ...props }) => (
  <Text {...props}>{formatBig6USDPrice(value, { compact: Boolean(compact) })}</Text>
)

interface FormattedBig6PercentProps extends TextProps {
  value: bigint
}
export const FormattedBig6Percent: React.FC<FormattedBig6PercentProps> = ({ value, ...props }) => (
  <Text {...props}>{formatBig6Percent(value)}</Text>
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
        <Text as="span" color="white">
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

export const SocializationNotice = ({ onClose }: { onClose?: () => void }) => {
  const intl = useIntl()
  const { selectedMarketSnapshot2 } = useMarketContext()
  const notice = intl.formatMessage({ defaultMessage: 'Notice' })
  const title = intl.formatMessage({ defaultMessage: 'Insufficient Maker Liquidity' })
  const majorSide = selectedMarketSnapshot2?.majorSide
  const minorSide = selectedMarketSnapshot2?.minorSide
  const body = intl.formatMessage(
    {
      defaultMessage: 'New {majorSide} positions may not be opened until more {minorSide} liquidity is added.',
    },
    { majorSide, minorSide },
  )
  const purple = colors.brand.purple[240]

  return (
    <Container border={onClose ? `1px solid ${purple}` : 'none'} bg={colors.brand.gray[250]} p={0} maxWidth="230px">
      <Flex flexDirection="column" p={2}>
        <Flex alignItems="center" justifyContent={'space-between'}>
          <Text fontSize="12px" color={purple}>
            {notice}
          </Text>
          {onClose && (
            <CloseIcon
              onClick={onClose}
              cursor="pointer"
              color={colors.brand.whiteAlpha[50]}
              height="10px"
              width="10px"
              _hover={{ color: colors.brand.whiteAlpha[70] }}
            />
          )}
        </Flex>
        <Text>{title}</Text>
      </Flex>
      <Box width="100%" height="1px" bg={colors.brand.whiteAlpha[10]} />
      <Flex flexDirection="column" p={2}>
        <Text fontSize="12px" color={colors.brand.whiteAlpha[50]}>
          {body}
        </Text>
      </Flex>
    </Container>
  )
}

export const StaleAfterMessage = ({ staleAfter }: { staleAfter: string }) => {
  const copy = useAdjustmentModalCopy()
  const staleAfterSpan = (
    <Text as="span" color={colors.brand.purple[240]}>
      {staleAfter}
      <Text as="span" ml={1}>
        {copy.seconds}
      </Text>
    </Text>
  )

  return (
    <Flex px={2}>
      <Text variant="label" fontSize="12px">
        {copy.staleAfterMessage(staleAfterSpan)}
      </Text>
    </Flex>
  )
}
