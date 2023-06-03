import { useIntl } from 'react-intl'

export const useAdjustmentModalCopy = () => {
  const intl = useIntl()
  return {
    approve: intl.formatMessage({ defaultMessage: 'Approve' }),
    approveUSDC: intl.formatMessage({ defaultMessage: 'Approve USDC' }),
    placeOrder: intl.formatMessage({ defaultMessage: 'Place Order' }),
    confirm: intl.formatMessage({ defaultMessage: 'Confirm' }),
    cancel: intl.formatMessage({ defaultMessage: 'Cancel' }),
  }
}
