import { useIntl } from 'react-intl'

export const useClaimModalCopy = () => {
  const intl = useIntl()
  return {
    title: intl.formatMessage({ defaultMessage: 'Withdraw your collateral' }),
    modalBody: intl.formatMessage({
      defaultMessage: 'Claim your collateral from the vault',
    }),
    Withdraw: intl.formatMessage({ defaultMessage: 'Withdraw' }),
    withdrawFromVault: intl.formatMessage({ defaultMessage: 'Withdraw from vault' }),
    withdrawAssets: intl.formatMessage({ defaultMessage: 'Withdraw assets' }),
    approveDSU: intl.formatMessage({ defaultMessage: 'Approve DSU' }),
    cancel: intl.formatMessage({ defaultMessage: 'Cancel' }),
  }
}
