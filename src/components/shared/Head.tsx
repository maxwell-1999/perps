import NextHead from 'next/head'
import { useIntl } from 'react-intl'

import { useLivePriceContext } from '@/contexts/livePriceContext'
import { useMarketContext } from '@/contexts/marketContext'
import { formatBig6USDPrice } from '@/utils/big6Utils'

interface HeadProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export default function Head({ title, children, description }: HeadProps) {
  const intl = useIntl()
  const defaultDescription = intl.formatMessage({
    defaultMessage: 'Buffer Perpetual is your one-stop web app for Perpetual Trading ',
  })
  const perennialTitle = intl.formatMessage(
    {
      defaultMessage: '{title} | Buffer Perpetual Trading',
    },
    { title },
  )
  const pageDescription = description ? description : defaultDescription
  return (
    <NextHead>
      <title>{perennialTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* <link rel="icon" href="/logo.svg" /> */}
      {children}
    </NextHead>
  )
}

export const HeadWithLivePrices = () => {
  const livePrices = useLivePriceContext()
  const { assetMetadata, selectedMarketSnapshot2, selectedMarket, isMaker, selectedMakerMarket } = useMarketContext()
  const { symbol } = assetMetadata
  const chainPrice = selectedMarketSnapshot2?.global?.latestPrice ?? 0n
  const price = livePrices[isMaker ? selectedMakerMarket : selectedMarket] ?? chainPrice ?? 0n
  const title = price ? `${formatBig6USDPrice(price)} ${symbol}` : symbol

  return <Head title={title} />
}
