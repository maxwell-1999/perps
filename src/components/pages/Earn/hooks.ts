import { useIntl } from 'react-intl'

import { VaultSymbol } from '@/constants/vaults'

export const useVaultDescription = () => {
  const intl = useIntl()
  const blueChipDescription = intl.formatMessage({
    defaultMessage:
      'Blue Chip Vaults (PVA) deploys liquidity to markets of major crypto assets. Right now, this includes 2 pools: ETH-long & ETH-short.',
  })
  const arbitrumVaultDescription = intl.formatMessage({
    defaultMessage:
      'Arbitrum Ecosystem Vaults (PVB) deploys liquidity to markets of Arbitrum ecosystem assets. Right now, this includes 2 pools: ARB-long & ARB-short.',
  })
  return {
    [VaultSymbol.ePBV]: blueChipDescription,
    [VaultSymbol.PVA]: blueChipDescription,
    [VaultSymbol.PVB]: arbitrumVaultDescription,
  }
}
