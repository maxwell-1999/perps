import { useIntl } from 'react-intl'

export const useVaultSelectCopy = () => {
  const intl = useIntl()

  return {
    selectVault: intl.formatMessage({ defaultMessage: 'Select vault' }),
    toViewDetails: intl.formatMessage({ defaultMessage: 'to view details' }),
    apr: intl.formatMessage({ defaultMessage: 'APR' }),
    ofCapacity: intl.formatMessage({ defaultMessage: 'of capacity' }),
  }
}
