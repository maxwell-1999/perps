import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { VaultSymbol } from '@/constants/vaults'
import { VaultSnapshot } from '@/hooks/vaults'
import { Big18Math } from '@/utils/big18Utils'
import { add, calcExposure, calcFunding, calcLeverage, next } from '@/utils/positionUtils'
import { Year } from '@/utils/timeUtils'

export const useVaultDescription = () => {
  const intl = useIntl()
  const blueChipDescription = intl.formatMessage({
    defaultMessage:
      'Blue Chip Vaults (PVA) deploys liquidity to markets of major crypto assets. Currently, this includes 2 pools: ETH-long & ETH-short.',
  })
  const arbitrumVaultDescription = intl.formatMessage({
    defaultMessage:
      'Arbitrum Ecosystem Vaults (PVB) deploys liquidity to markets of Arbitrum ecosystem assets. Currently, this includes 2 pools: ARB-long & ARB-short.',
  })
  return {
    [VaultSymbol.ePBV]: blueChipDescription,
    [VaultSymbol.PVA]: blueChipDescription,
    [VaultSymbol.PVB]: arbitrumVaultDescription,
  }
}

export const useExposureAndFunding = ({ vault }: { vault?: VaultSnapshot }) => {
  const exposureAndFunding = useMemo(() => {
    if (!vault) {
      return
    }

    const price = vault.longSnapshot.latestVersion?.price ?? 0n
    const longPosition = next(vault.longUserSnapshot.pre, vault.longUserSnapshot.position)
    const shortPosition = next(vault.shortUserSnapshot.pre, vault.shortUserSnapshot.position)
    const totalPosition = add(longPosition, shortPosition)
    const leverage = calcLeverage(price as bigint, totalPosition.maker, vault.totalAssets)

    const longExposure = calcExposure(longPosition.maker, next(vault.longSnapshot.pre, vault.longSnapshot.position))
    const shortExposure = calcExposure(shortPosition.maker, next(vault.shortSnapshot.pre, vault.shortSnapshot.position))

    const delta = Big18Math.isZero(totalPosition.maker)
      ? 0n
      : Big18Math.div(Big18Math.sub(longExposure, shortExposure), Big18Math.mul(totalPosition.maker, -Big18Math.ONE))

    const isLongExposure = delta > 0n

    const exposure = Math.abs(Big18Math.toUnsafeFloat(Big18Math.mul(leverage, delta))) * 100

    // Funding = Short(Utilization * Rate * Leverage) + Long(Utilization * Rate * Leverage)
    const longFunding = calcFunding(
      leverage,
      vault.longSnapshot.rate,
      next(vault.longSnapshot.pre, vault.longSnapshot.position),
    )
    const shortFunding = calcFunding(
      leverage,
      vault.shortSnapshot.rate,
      next(vault.shortSnapshot.pre, vault.shortSnapshot.position),
    )

    const totalFundingAPR = ((longFunding + shortFunding) / 2n) * Year

    return { exposure, isLongExposure, totalFundingAPR }
  }, [vault])

  return exposureAndFunding
}
