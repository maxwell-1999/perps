import { useIntl } from 'react-intl'

export const useAdjustmentModalCopy = () => {
  const intl = useIntl()
  return {
    approve: intl.formatMessage({ defaultMessage: 'Approve' }),
    approveUSDC: intl.formatMessage({ defaultMessage: 'Approve USDC' }),
    placeOrder: intl.formatMessage({ defaultMessage: 'Place Order' }),
    confirm: intl.formatMessage({ defaultMessage: 'Confirm' }),
    cancel: intl.formatMessage({ defaultMessage: 'Cancel' }),
    side: intl.formatMessage({ defaultMessage: 'Side' }),
    long: intl.formatMessage({ defaultMessage: 'Long' }),
    short: intl.formatMessage({ defaultMessage: 'Short' }),
    positionSizeAsset: (asset: string) =>
      intl.formatMessage({ defaultMessage: 'Size ({asset})' }, { asset: asset.toUpperCase() }),
    fees: intl.formatMessage({ defaultMessage: 'Fees' }),
    collateral: intl.formatMessage({ defaultMessage: 'Collateral' }),
    leverage: intl.formatMessage({ defaultMessage: 'Leverage' }),
    position: intl.formatMessage({ defaultMessage: 'Position' }),
    withdraw: intl.formatMessage({ defaultMessage: 'Withdraw' }),
    signTransactionTitle: intl.formatMessage({ defaultMessage: 'Sign transaction' }),
    signTransactionBody: intl.formatMessage({
      defaultMessage: 'Place your trade.',
    }),
    withdrawStepTitle: intl.formatMessage({ defaultMessage: 'Withdraw collateral' }),
    withdrawStepBody: intl.formatMessage({
      defaultMessage: 'Remove USD from your position',
    }),
    withdrawDetailTitle: intl.formatMessage({ defaultMessage: 'Remove collateral' }),
    confirmCloseTitle: intl.formatMessage({ defaultMessage: 'Confirm Close' }),
    confirmCloseBody: intl.formatMessage({
      defaultMessage: 'Please check your wallet, and confirm the following request to close your trade.',
    }),
    awaitSettlementTitle: intl.formatMessage({ defaultMessage: 'Await Settlement' }),
    awaitSettlementBody: intl.formatMessage({
      defaultMessage: 'Once your trade has settled you may withdraw your funds.',
    }),
    confirmWithdrawTitle: intl.formatMessage({ defaultMessage: 'Confirm Withdrawal' }),
    approveUsdcTitle: intl.formatMessage({ defaultMessage: 'Approve USDC' }),
    approveUsdcBody: intl.formatMessage({
      defaultMessage: 'Approve funds to trade on Perennial.',
    }),
    approveRequests: intl.formatMessage({
      defaultMessage: 'Please check your wallet, and confirm the following requests.',
    }),
    orderPlaced: intl.formatMessage({
      defaultMessage: 'Order placed',
    }),
    positionChanged: intl.formatMessage({ defaultMessage: 'Position changed' }),
    positionClose: intl.formatMessage({ defaultMessage: 'Position close' }),
    buy: intl.formatMessage({ defaultMessage: 'Buy' }),
    sell: intl.formatMessage({ defaultMessage: 'Sell' }),
    increase: intl.formatMessage({ defaultMessage: 'Increase' }),
    decrease: intl.formatMessage({ defaultMessage: 'Decrease' }),
    positionSettled: intl.formatMessage({ defaultMessage: 'Position settled' }),
    yourPositionHasSettled: intl.formatMessage({ defaultMessage: 'Your position has settled' }),
    withdrawComplete: intl.formatMessage({ defaultMessage: 'Withdrawal complete' }),
  }
}

export type ModalCopy = ReturnType<typeof useAdjustmentModalCopy>
