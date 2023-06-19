import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { VaultSnapshot, VaultUserSnapshot } from '@/constants/vaults'
import { sum } from '@/utils/arrayUtils'
import { Big18Math } from '@/utils/big18Utils'
import { add, calcExposure, calcLeverage, next } from '@/utils/positionUtils'

export const useVaultDetailCopy = () => {
  const intl = useIntl()
  return {
    earnWith: intl.formatMessage({ defaultMessage: 'Earn with' }),
    vaults: intl.formatMessage({ defaultMessage: 'Vaults' }),
    emptyStateSubhead: intl.formatMessage({
      defaultMessage:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non felis fermentum, faucibus nisi in, posuere ligula.',
    }),
    featureTitle: intl.formatMessage({ defaultMessage: 'Feature Title' }),
    featureDescription: intl.formatMessage({
      defaultMessage: 'Description of value proposition goes here',
    }),
    liquidityDisclaimer: intl.formatMessage({
      defaultMessage:
        'Liquidity provided to Perennial is autonomously provisioned, taking the other side against traders in exchange for funding.',
    }),
    selectVaultToContinue: intl.formatMessage({
      defaultMessage: 'Select vault to continue',
    }),
    viewing: intl.formatMessage({
      defaultMessage: 'Viewing',
    }),
    assetsSupported: intl.formatMessage({
      defaultMessage: 'Assets supported',
    }),
    currentExposure: intl.formatMessage({
      defaultMessage: 'Current Exposure',
    }),
    deposited: intl.formatMessage({ defaultMessage: 'Deposited' }),
    capacity: intl.formatMessage({ defaultMessage: 'Capacity' }),
    long: intl.formatMessage({ defaultMessage: 'Long' }),
    short: intl.formatMessage({ defaultMessage: 'Short' }),
    noPositionToShow: intl.formatMessage({ defaultMessage: 'No position to show' }),
    position: intl.formatMessage({ defaultMessage: 'Position' }),
    value: intl.formatMessage({ defaultMessage: 'Value' }),
    pnl: intl.formatMessage({ defaultMessage: 'P&L' }),
    noValue: intl.formatMessage({ defaultMessage: '——' }),
    infinite: intl.formatMessage({ defaultMessage: '$∞' }),
  }
}

export const usePnl = ({
  vault,
  vaultUserSnapshot,
}: {
  vault?: VaultSnapshot
  vaultUserSnapshot?: VaultUserSnapshot
}) => {
  const pnl = useMemo(() => {
    if (!vault || !vaultUserSnapshot) {
      return Big18Math.ZERO
    }

    const inflightRedemption = Big18Math.isZero(vault.totalSupply)
      ? Big18Math.ZERO
      : Big18Math.div(Big18Math.mul(vaultUserSnapshot.pendingRedemptionAmount, vault.totalAssets), vault.totalSupply)

    const userNetDeposits = vaultUserSnapshot
      ? Big18Math.sub(vaultUserSnapshot.currentPositionDeposits, vaultUserSnapshot.currentPositionClaims)
      : Big18Math.ZERO

    const _pnl = Big18Math.sub(
      sum([
        vaultUserSnapshot.assets,
        vaultUserSnapshot.claimable,
        vaultUserSnapshot.pendingDepositAmount,
        inflightRedemption,
      ]),
      userNetDeposits,
    )

    return _pnl
  }, [vault, vaultUserSnapshot])

  return pnl
}

export const useExposure = ({ vault }: { vault?: VaultSnapshot; vaultUserSnapshot?: VaultUserSnapshot }) => {
  const exposureData = useMemo(() => {
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

    const exposure = Math.abs(Big18Math.fixedFrom(Big18Math.mul(leverage, delta)).toUnsafeFloat()) * 100
    return { exposure, isLongExposure }
  }, [vault])

  return exposureData
}
