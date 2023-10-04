import { useIntl } from 'react-intl'

export const useChartCopy = () => {
  const intl = useIntl()
  return {
    priceChart: intl.formatMessage({ defaultMessage: 'Price Chart' }),
    marketInfo: intl.formatMessage({ defaultMessage: 'Market Info' }),
    market: intl.formatMessage({ defaultMessage: 'Market' }),
    address: intl.formatMessage({ defaultMessage: 'Address' }),
    priceFeed: intl.formatMessage({ defaultMessage: 'Price Feed' }),
    collateral: intl.formatMessage({ defaultMessage: 'Collateral' }),
    margin: intl.formatMessage({ defaultMessage: 'Margin (Min.)' }),
    maintenance: intl.formatMessage({ defaultMessage: 'Maintenance (Min.)' }),
    takerFees: intl.formatMessage({ defaultMessage: 'Taker Fees' }),
    makerFees: intl.formatMessage({ defaultMessage: 'Maker Fees' }),
    liquidationFee: intl.formatMessage({ defaultMessage: 'Liquidation Fee' }),
    maxLiquidationFee: intl.formatMessage({ defaultMessage: 'Max. Liquidation Fee' }),
    liquidationLeverage: intl.formatMessage({ defaultMessage: 'Liquidation Leverage' }),
    utilization: intl.formatMessage({ defaultMessage: 'Utilization →' }),
    funding: intl.formatMessage({ defaultMessage: 'Funding →' }),
    utilizationCurve: intl.formatMessage({ defaultMessage: 'Utilization Curve' }),
    longUtilization: intl.formatMessage({ defaultMessage: 'Long' }),
    shortUtilization: intl.formatMessage({ defaultMessage: 'Short' }),
    current: intl.formatMessage({ defaultMessage: 'Current' }),
    fundingFee: intl.formatMessage({ defaultMessage: 'Funding Fee' }),
    interestFee: intl.formatMessage({ defaultMessage: 'Interest Fee' }),
    settlementFee: intl.formatMessage({ defaultMessage: 'Settlement Fee' }),
    latestPrice: intl.formatMessage({ defaultMessage: 'Latest Price' }),
    efficiencyLimit: intl.formatMessage({ defaultMessage: 'Efficiency Limit' }),
    minLiquidationFee: intl.formatMessage({ defaultMessage: 'Min. Liquidation Fee' }),
  }
}
