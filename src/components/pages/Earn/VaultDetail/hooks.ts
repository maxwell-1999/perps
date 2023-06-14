import { useIntl } from 'react-intl'

export const useVaultDetailCopy = () => {
  const intl = useIntl()
  return {
    earnWith: intl.formatMessage({ defaultMessage: 'Earn with' }),
    vaults: intl.formatMessage({ defaultMessage: 'Vaults' }),
    emptyStateSubhead: intl.formatMessage({
      defaultMessage:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non felis fermentum, faucibus nisi in, posuere ligula.',
    }),
    featureTitle: intl.formatMessage({ defaultMessage: 'Feature Title' }),
    featureDescription: intl.formatMessage({
      defaultMessage: 'Description of value proposition goes here',
    }),
    liquidityDisclaimer: intl.formatMessage({
      defaultMessage:
        'Liquidity provided to Perennial is autonomously provisioned, taking the other side against traders in exchange for funding.',
    }),
    selectVaultToContinue: intl.formatMessage({
      defaultMessage: 'Select vault to continue',
    }),
  }
}
