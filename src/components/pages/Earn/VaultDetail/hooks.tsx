import { useToast } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { useIntl } from 'react-intl'

import Toast, { ToastMessage } from '@/components/shared/Toast'
import { VaultAccountSnapshot2, VaultPositionHistory, VaultSnapshot2 } from '@/hooks/vaults2'
import { sum } from '@/utils/arrayUtils'
import { Big6Math } from '@/utils/big6Utils'

export const useVaultDetailCopy = () => {
  const intl = useIntl()
  return {
    earnWith: intl.formatMessage({ defaultMessage: 'Earn with' }),
    vaults: intl.formatMessage({ defaultMessage: 'Vaults' }),
    emptyStateSubhead: intl.formatMessage({
      defaultMessage:
        'Vaults provide liquidity to Perennial markets, taking the other side of trades in exchange for funding & trading fees.',
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
      defaultMessage: 'Built-in incentives to keep longs & shorts balanced, reducing overall maker exposure.',
    }),
    capitalEfficient: intl.formatMessage({
      defaultMessage: 'Capital Efficient',
    }),
    capitalEfficientBody: intl.formatMessage({
      defaultMessage:
        'Native netting of longs and shorts, makers only cover the difference — capital efficiency at its finest.',
    }),
    pendingWithdrawal: intl.formatMessage({
      defaultMessage: 'Once your position settles you may withdraw your funds.',
    }),
    withdrawPending: intl.formatMessage({ defaultMessage: 'Withdraw pending' }),
    positionSettled: intl.formatMessage({ defaultMessage: 'Position settled' }),
    yourPositionHasSettled: intl.formatMessage({ defaultMessage: 'Your position has settled' }),
    ethereumUnavailable: (link: React.ReactNode) =>
      intl.formatMessage(
        {
          defaultMessage:
            'Perennial Vaults are not available on Ethereum L1. Experienced users can use the {link} to open and manage Maker positions in markets directly.',
        },
        { link },
      ),
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
    back: intl.formatMessage({ defaultMessage: 'Back' }),
    readTheDocs: intl.formatMessage({ defaultMessage: 'Read the documentation for more information' }),
  }
}

export const usePnl = ({
  vault,
  vaultAccountSnapshot,
  vaultPositionHistory,
}: {
  vault?: VaultSnapshot2
  vaultAccountSnapshot?: VaultAccountSnapshot2
  vaultPositionHistory?: VaultPositionHistory
}) => {
  const pnl = useMemo(() => {
    if (!vault || !vaultAccountSnapshot || !vaultPositionHistory) {
      return 0n
    }

    const userNetDeposits = vaultPositionHistory
      ? Big6Math.sub(vaultPositionHistory.currentPositionDeposits, vaultPositionHistory.currentPositionClaims)
      : Big6Math.ZERO

    const _pnl = Big6Math.sub(
      sum([
        vaultAccountSnapshot.assets,
        vaultAccountSnapshot.accountData.assets,
        vaultAccountSnapshot.accountData.deposit,
        vaultAccountSnapshot.redemptionAssets,
      ]),
      userNetDeposits,
    )

    return _pnl
  }, [vault, vaultAccountSnapshot, vaultPositionHistory])

  return pnl
}

export const usePositionSettledToast = ({
  vaultName,
  prevVaultName,
  prevPositionUpdating,
  positionUpdating,
  copy,
}: {
  vaultName?: string
  prevVaultName?: string
  prevPositionUpdating?: boolean
  positionUpdating?: boolean
  copy: ReturnType<typeof useVaultDetailCopy>
}) => {
  const toast = useToast()

  useEffect(() => {
    if (prevPositionUpdating && !positionUpdating && vaultName === prevVaultName) {
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
  }, [positionUpdating, prevPositionUpdating, copy, toast, vaultName, prevVaultName])
}
