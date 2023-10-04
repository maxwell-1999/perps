import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { addressToAsset2 } from '@/constants/markets'
import { PerennialVaultType } from '@/constants/vaults'
import { VaultSnapshot2 } from '@/hooks/vaults2'
import { VaultAccumulations } from '@/hooks/vaults2'
import { sum } from '@/utils/arrayUtils'
import { Big6Math, BigOrZero } from '@/utils/big6Utils'
import { calcMakerExposure } from '@/utils/positionUtils'

export const useVaultDescription = () => {
  const intl = useIntl()
  const alphaVaultDescription = intl.formatMessage({
    defaultMessage:
      'The Blue Chip Vault deploys liquidity to the markets of blue chip assets. Currently, this includes 2 markets: ETH and BTC.',
  })
  const bravoVaultDescription = intl.formatMessage({
    defaultMessage:
      'The Large Cap Vault deploys liquidity to the markets of infrastructure assets. Currently, this includes 2 markets: SOL and MATIC.',
  })
  return {
    [PerennialVaultType.alpha]: alphaVaultDescription,
    [PerennialVaultType.bravo]: bravoVaultDescription,
  }
}

export const useExposureAndFunding = ({
  vault,
  accumulations,
}: {
  vault?: VaultSnapshot2
  accumulations?: VaultAccumulations
}) => {
  const exposureAndFunding = useMemo(() => {
    if (!vault) {
      return
    }

    const { registrations, marketSnapshots, marketVaultSnapshots } = vault

    const marketExposures = registrations.map((registration) => {
      const marketSnapshot = marketSnapshots.find((v) => v.market === registration.market)
      const marketVaultSnapshot = marketVaultSnapshots.find((v) => v.market === registration.market)
      const price = marketSnapshot?.global.latestPrice ?? 0n
      const vaultMakerPosition = marketVaultSnapshot?.nextPosition.maker ?? 0n

      const exposure = calcMakerExposure(
        vaultMakerPosition,
        marketSnapshot?.nextPosition.maker ?? 0n,
        marketSnapshot?.nextPosition.long ?? 0n,
        marketSnapshot?.nextPosition.short ?? 0n,
      )
      const usdExposure = Big6Math.mul(exposure, price)
      const assets = marketVaultSnapshot?.local.collateral ?? 0n

      const marketAccumulations = accumulations?.marketValues.find((v) => v.market === registration.market)

      return {
        asset: addressToAsset2(registration.market),
        usdExposure,
        assets,
        exposurePct: assets > 0n ? Big6Math.toUnsafeFloat(Big6Math.div(usdExposure, assets)) * 100 : 0,
        weight: registration.weight,
        ...marketAccumulations,
      }
    })

    const netUSDExposure = sum(marketExposures.map(({ usdExposure }) => usdExposure))
    const netExposurePct = Big6Math.toUnsafeFloat(Big6Math.div(netUSDExposure, vault.totalAssets)) * 100

    const totalFundingAPR =
      marketExposures.reduce((acc, curr) => acc + BigOrZero(curr.weightedAverageFundingInterest), 0n) * 52n
    const totalFeeAPR =
      marketExposures.reduce((acc, curr) => acc + BigOrZero(curr.weightedAverageMakerPositionFees), 0n) * 52n

    return {
      marketExposures,
      exposure: Math.abs(netExposurePct),
      isLongExposure: netExposurePct > 0n,
      totalFundingAPR,
      totalFeeAPR,
      totalWeight: registrations.reduce((acc, curr) => acc + curr.weight, 0n),
    }
  }, [vault, accumulations])

  return exposureAndFunding
}
