import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { getAddress } from 'viem'

import { SupportedAsset, addressToAsset2 } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { OpenOrder, useOpenOrders } from '@/hooks/markets2'

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
    approveUsdcBody: (approvalAmount: React.ReactNode) =>
      intl.formatMessage(
        {
          defaultMessage: 'Approve {approvalAmount} USDC to trade on Perennial.',
        },
        { approvalAmount },
      ),
    insufficientUsdcApproval: (requiredAmount: React.ReactNode) =>
      intl.formatMessage(
        {
          defaultMessage: 'You must approve at least {requiredAmount} USDC',
        },
        { requiredAmount },
      ),
    approveRequests: intl.formatMessage({
      defaultMessage: 'Please check your wallet, and confirm the following requests.',
    }),
    orderSent: intl.formatMessage({
      defaultMessage: 'Order sent',
    }),
    positionChanged: intl.formatMessage({ defaultMessage: 'Position changed' }),
    positionClose: intl.formatMessage({ defaultMessage: 'Position close' }),
    buyOrderType: (orderType: string) => intl.formatMessage({ defaultMessage: '{orderType}Buy' }, { orderType }),
    sellOrderType: (orderType: string) => intl.formatMessage({ defaultMessage: '{orderType}Sell' }, { orderType }),
    increaseOrderType: (orderType: string) =>
      intl.formatMessage({ defaultMessage: '{orderType}Increase' }, { orderType }),
    decreaseOrderType: (orderType: string) =>
      intl.formatMessage({ defaultMessage: '{orderType}Decrease' }, { orderType }),
    market: intl.formatMessage({ defaultMessage: 'Market' }),
    limit: intl.formatMessage({ defaultMessage: 'Limit' }),
    stopLoss: intl.formatMessage({ defaultMessage: 'Stop Loss' }),
    takeProfit: intl.formatMessage({ defaultMessage: 'Take Profit' }),
    positionSettled: intl.formatMessage({ defaultMessage: 'Position settled' }),
    yourPositionHasSettled: intl.formatMessage({ defaultMessage: 'Your position has settled' }),
    withdrawComplete: intl.formatMessage({ defaultMessage: 'Withdrawal complete' }),
    modifyCollateral: intl.formatMessage({ defaultMessage: 'Modify collateral' }),
    interfaceFee: intl.formatMessage({ defaultMessage: 'Ecosystem fee' }),
    priceImpact: intl.formatMessage({ defaultMessage: 'Est. Price Impact' }),
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
    limitPrice: intl.formatMessage({ defaultMessage: 'Limit Price' }),
    change: intl.formatMessage({ defaultMessage: 'Change' }),
    cancelAllOrders: (asset: string) =>
      intl.formatMessage(
        {
          defaultMessage: 'Cancel open {asset} orders',
        },
        { asset },
      ),
    toggleCancelOrders: intl.formatMessage({ defaultMessage: 'Toggle cancel orders' }),
  }
}

export type ModalCopy = ReturnType<typeof useAdjustmentModalCopy>

export const useOpenOrdersForMarket = (market: SupportedAsset) => {
  const { isMaker } = useMarketContext()
  const { data: openOrderData } = useOpenOrders(isMaker)
  const openOrders = useMemo(() => {
    if (!openOrderData) {
      return []
    }
    return openOrderData.pages
      .map((page) => page?.openOrders)
      .flat()
      .filter((order) => {
        return order && market === addressToAsset2(getAddress(order.market))
      }) as OpenOrder[]
  }, [openOrderData, market])

  return openOrders
}
