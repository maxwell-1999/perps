import { useIntl } from 'react-intl'

import { formatBig6USDPrice } from '@/utils/big6Utils'

export const useAdjustmentModalCopy = () => {
  const intl = useIntl()
  return {
    approve: intl.formatMessage({ defaultMessage: 'Approve' }),
    approveUSDC: intl.formatMessage({ defaultMessage: 'Approve USDC' }),
    placeOrder: intl.formatMessage({ defaultMessage: 'Place Order' }),
    confirm: intl.formatMessage({ defaultMessage: 'Confirm' }),
    cancel: intl.formatMessage({ defaultMessage: 'Cancel' }),
    side: intl.formatMessage({ defaultMessage: 'Side' }),
    maker: intl.formatMessage({ defaultMessage: 'Maker' }),
    long: intl.formatMessage({ defaultMessage: 'Long' }),
    short: intl.formatMessage({ defaultMessage: 'Short' }),
    positionSizeAsset: (asset: string) =>
      intl.formatMessage({ defaultMessage: 'Size ({asset})' }, { asset: asset.toUpperCase() }),
    estEntry: intl.formatMessage({ defaultMessage: 'Est. Entry' }),
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
    insufficientUsdcApproval: (requiredAmount: bigint) =>
      intl.formatMessage(
        {
          defaultMessage: 'You must approve at least {requiredAmount} USDC',
        },
        { requiredAmount: formatBig6USDPrice(requiredAmount, { fullPrecision: true }) },
      ),
    approveRequests: intl.formatMessage({
      defaultMessage: 'Please check your wallet, and confirm the following requests.',
    }),
    orderSent: intl.formatMessage({
      defaultMessage: 'Order sent',
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
    modifyCollateral: intl.formatMessage({ defaultMessage: 'Modify collateral' }),
    interfaceFee: intl.formatMessage({ defaultMessage: 'Ecosystem fee' }),
    priceImpact: intl.formatMessage({ defaultMessage: 'Est. Price impact' }),
    fee: intl.formatMessage({ defaultMessage: 'Fee' }),
    retryFailedOrder: intl.formatMessage({ defaultMessage: 'Retry failed order?' }),
    retryBody: intl.formatMessage({
      defaultMessage: 'This order was not able to be processed. Would you like to try again?',
    }),
    make: intl.formatMessage({ defaultMessage: 'Make' }),
    staleAfterMessage: (staleAfter: React.ReactNode) =>
      intl.formatMessage(
        {
          defaultMessage:
            'After submitting your update, confirm the transaction in your wallet within {staleAfter} to avoid reverts.',
        },
        { staleAfter },
      ),
    seconds: intl.formatMessage({ defaultMessage: 'seconds' }),
  }
}

export type ModalCopy = ReturnType<typeof useAdjustmentModalCopy>
