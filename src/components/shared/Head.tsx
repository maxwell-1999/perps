import NextHead from 'next/head'
import { useIntl } from 'react-intl'

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
      defaultMessage: 'Perennial - {title}',
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
