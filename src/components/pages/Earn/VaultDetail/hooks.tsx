import { useToast } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { useIntl } from 'react-intl'

import Toast, { ToastMessage } from '@/components/shared/Toast'
import { VaultSnapshot, VaultUserSnapshot } from '@/hooks/vaults'
import { sum } from '@/utils/arrayUtils'
import { Big18Math } from '@/utils/big18Utils'

export const useVaultDetailCopy = () => {
  const intl = useIntl()
  return {
    earnWith: intl.formatMessage({ defaultMessage: 'Earn with' }),
    vaults: intl.formatMessage({ defaultMessage: 'Vaults' }),
    emptyStateSubhead: intl.formatMessage({
      defaultMessage:
        'Vaults provide liquidity to Perennial markets, taking the other side of trades in exchange for funding & trading fees. See more here:',
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
    marketsSupported: intl.formatMessage({
      defaultMessage: 'Markets Supported',
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
    yourWithdrawIsReady: intl.formatMessage({ defaultMessage: 'Your withdraw is ready' }),
    confirmWithdraw: intl.formatMessage({ defaultMessage: 'Confirm withdrawal' }),
    positionUpdating: intl.formatMessage({ defaultMessage: 'Your position is being updated' }),
    autonomous: intl.formatMessage({ defaultMessage: 'Autonomous' }),
    autonomousBody: intl.formatMessage({
      defaultMessage:
        'Fully on-chain smart contracts deploy liquidity & adjust multiple positions, so you don’t have to.',
    }),
    deltaHedged: intl.formatMessage({
      defaultMessage: 'Delta-Hedged',
    }),
    deltaHedgedBody: intl.formatMessage({
      defaultMessage: 'Deploy liquidity to both long & short sides of the market, reducing net exposure.',
    }),
    capitalEfficient: intl.formatMessage({
      defaultMessage: 'Capital Efficient',
    }),
    capitalEfficientBody: intl.formatMessage({
      defaultMessage: 'Take advantage of the power of the Perennial protocol to get high utilization of capital.',
    }),
    pendingWithdrawal: intl.formatMessage({
      defaultMessage: 'Once your position settles you may withdraw your funds.',
    }),
    withdrawPending: intl.formatMessage({ defaultMessage: 'Withdraw pending' }),
    positionSettled: intl.formatMessage({ defaultMessage: 'Position settled' }),
    yourPositionHasSettled: intl.formatMessage({ defaultMessage: 'Your position has settled' }),
    ethereumUnavailable: intl.formatMessage({
      defaultMessage:
        'Perennial Vaults are not available on Ethereum L1. A new Pro LP maker experience is coming soon to all networks.',
    }),
    ethereumUnavailableLink: intl.formatMessage({
      defaultMessage: 'If you have existing LP positions you can manage them at ',
    }),
    fundingFees: intl.formatMessage({ defaultMessage: 'Funding Fees' }),
    tradingFees: intl.formatMessage({ defaultMessage: 'Trading Fees' }),
    totalAPR: intl.formatMessage({ defaultMessage: 'Total APR' }),
    vaultPnlTooltip: intl.formatMessage({
      defaultMessage: 'Annualized values do not include net profit or loss as counterparty for traders',
    }),
    currentExposureTooltip: intl.formatMessage({
      defaultMessage:
        "The net direction of the Vault's current market position. Larger directional exposure will result in greater counterparty profit/loss when the price moves.",
    }),
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

export const usePositionSettledToast = ({
  prevPositionUpdating,
  positionUpdating,
  copy,
}: {
  prevPositionUpdating?: boolean
  positionUpdating?: boolean
  copy: ReturnType<typeof useVaultDetailCopy>
}) => {
  const toast = useToast()

  useEffect(() => {
    if (prevPositionUpdating && !positionUpdating) {
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.positionSettled}
            onClose={onClose}
            body={<ToastMessage message={copy.yourPositionHasSettled} />}
          />
        ),
      })
    }
  }, [positionUpdating, prevPositionUpdating, copy, toast])
}
