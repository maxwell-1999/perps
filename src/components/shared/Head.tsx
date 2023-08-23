import NextHead from 'next/head'
import { useIntl } from 'react-intl'

import { useMarketContext } from '@/contexts/marketContext'
import { useChainLivePrices } from '@/hooks/markets'
import { formatBig18USDPrice } from '@/utils/big18Utils'

interface HeadProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export default function Head({ title, children, description }: HeadProps) {
  const intl = useIntl()
  const defaultDescription = intl.formatMessage({
    defaultMessage: 'Perennial is the defi-native derivatives platform for traders and developers.',
  })
  const perennialTitle = intl.formatMessage(
    {
      defaultMessage: '{title} | Perennial',
    },
    { title },
  )
  const pageDescription = description ? description : defaultDescription
  return (
    <NextHead>
      <title>{perennialTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/logo.svg" />
      {children}
    </NextHead>
  )
}

export const HeadWithLivePrices = () => {
  const livePrices = useChainLivePrices()
  const {
    assetMetadata,
    selectedMarket,
    selectedMakerMarketSnapshot,
    selectedMarketSnapshot,
    orderDirection,
    makerAsset,
    isMaker,
  } = useMarketContext()
  const chainPrice = isMaker
    ? selectedMakerMarketSnapshot?.latestVersion?.price ?? 0n
    : selectedMarketSnapshot?.[orderDirection]?.latestVersion?.price ?? 0n
  const price = livePrices[isMaker ? makerAsset : selectedMarket] ?? chainPrice
  const { symbol } = assetMetadata
  const title = price ? `${formatBig18USDPrice(price)} ${symbol}` : symbol
  return <Head title={title} />
}
