import { useIntl } from 'react-intl'

export const useChartCopy = () => {
  const intl = useIntl()
  return {
    priceChart: intl.formatMessage({ defaultMessage: 'Price Chart' }),
    marketInfo: intl.formatMessage({ defaultMessage: 'Market Info' }),
    market: intl.formatMessage({ defaultMessage: 'Market' }),
    coordinator: intl.formatMessage({ defaultMessage: 'Coordinator' }),
    priceFeed: intl.formatMessage({ defaultMessage: 'Price Feed' }),
    collateral: intl.formatMessage({ defaultMessage: 'Collateral' }),
    minCollateral: intl.formatMessage({ defaultMessage: 'Min. Collateral' }),
    takerFees: intl.formatMessage({ defaultMessage: 'Taker Fees' }),
    makerFees: intl.formatMessage({ defaultMessage: 'Maker Fees' }),
    liquidationFee: intl.formatMessage({ defaultMessage: 'Liquidation Fee' }),
    maxLeverage: intl.formatMessage({ defaultMessage: 'Max Leverage' }),
    utilization: intl.formatMessage({ defaultMessage: 'Utilization →' }),
    funding: intl.formatMessage({ defaultMessage: 'Funding →' }),
    utilizationCurve: intl.formatMessage({ defaultMessage: 'Utilization Curve' }),
    longUtilization: intl.formatMessage({ defaultMessage: 'Long' }),
    shortUtilization: intl.formatMessage({ defaultMessage: 'Short' }),
    current: intl.formatMessage({ defaultMessage: 'Current' }),
  }
}
