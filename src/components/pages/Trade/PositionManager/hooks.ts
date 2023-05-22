import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

export const useStyles = () => {
  const theme = useTheme()
  const borderColor = useColorModeValue(theme.colors.brand.blackAlpha[10], theme.colors.brand.whiteAlpha[10])

  const subheaderTextColor = useColorModeValue(theme.colors.brand.blackAlpha[50], theme.colors.brand.whiteAlpha[50])

  const alpha75 = useColorModeValue(theme.colors.brand.blackAlpha[75], theme.colors.brand.whiteAlpha[75])

  const alpha90 = useColorModeValue(theme.colors.brand.blackAlpha[90], theme.colors.brand.whiteAlpha[90])

  const green = theme.colors.brand.green
  const red = theme.colors.brand.red
  return { borderColor, green, red, subheaderTextColor, alpha75, alpha90 }
}

export const usePositionManagerCopy = () => {
  const intl = useIntl()
  return {
    thisPosition: intl.formatMessage({ defaultMessage: 'This Position' }),
    allPositions: intl.formatMessage({ defaultMessage: 'All Positions' }),
    history: intl.formatMessage({ defaultMessage: 'History' }),
    open: intl.formatMessage({ defaultMessage: 'Open' }),
    long: intl.formatMessage({ defaultMessage: 'Long' }),
    short: intl.formatMessage({ defaultMessage: 'Short' }),
    size: intl.formatMessage({ defaultMessage: 'Size' }),
    pnl: intl.formatMessage({ defaultMessage: 'P&L' }),
    liquidationPrice: intl.formatMessage({ defaultMessage: 'Liquidation price' }),
    yourAverageEntry: intl.formatMessage({ defaultMessage: 'Your average entry' }),
    dailyFundingRate: intl.formatMessage({ defaultMessage: 'Daily funding rate' }),
    collateral: intl.formatMessage({ defaultMessage: 'Collateral' }),
    sharePosition: intl.formatMessage({ defaultMessage: 'Share position' }),
    modify: intl.formatMessage({ defaultMessage: 'Modify' }),
    close: intl.formatMessage({ defaultMessage: 'Close' }),
    x: intl.formatMessage({ defaultMessage: 'x' }),
  }
}
