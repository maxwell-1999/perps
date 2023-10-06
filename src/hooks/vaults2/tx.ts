import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { Address, zeroAddress } from 'viem'
import { useNetwork, useWalletClient } from 'wagmi'

import { useTransactionToasts } from '@/components/shared/Toast/transactionToasts'
import { MultiInvoker2Addresses } from '@/constants/contracts'
import { SupportedChainId } from '@/constants/network'
import { MaxUint256 } from '@/constants/units'
import { chainVaultsWithAddress } from '@/constants/vaults'
import { notEmpty } from '@/utils/arrayUtils'
import { Big6Math } from '@/utils/big6Utils'
import { buildCommitPrice, buildUpdateVault } from '@/utils/multiinvoker2'
import { buildCommitmentsForOracles } from '@/utils/pythUtils'
import { nowSeconds } from '@/utils/timeUtils'

import { MultiInvoker2Action } from '@t/perennial'

import { VaultSnapshot2, useVaultSnapshots2 } from '.'
import { bufferGasLimit, parseViemContractCustomError } from '../../utils/contractUtils'
import { useMultiInvoker2, useUSDC, useVaultFactory } from '../contracts'
import { MarketOracles, useMarketOracles2 } from '../markets2'
import { useAddress, useChainId, usePyth } from '../network'

export const useVaultTransactions = (vaultAddress: Address) => {
  const { chain } = useNetwork()
  const chainId = useChainId()
  const { address } = useAddress()
  const { data: walletClient } = useWalletClient({ chainId })
  const vaultFactory = useVaultFactory(walletClient ?? undefined)
  const pyth = usePyth()
  const { data: marketOracles } = useMarketOracles2()
  const { data: vaultSnapshots } = useVaultSnapshots2()
  const { waitForTransactionAlert } = useTransactionToasts()

  const addRecentTransaction = useAddRecentTransaction()
  const copy = useVaultTransactionCopy()

  const usdcContract = useUSDC(walletClient ?? undefined)
  const multiInvoker = useMultiInvoker2(walletClient ?? undefined)

  const vaultType = chainVaultsWithAddress(chainId).find(({ vaultAddress: v }) => v === vaultAddress)

  const queryClient = useQueryClient()

  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          ['vaultSnapshots2', 'vaultPositionHistory', 'balances'].includes(queryKey.at(0) as string) &&
          queryKey.includes(chainId),
      }),
    [chainId, queryClient],
  )

  const txOpts = { account: address || zeroAddress, chainId, chain }
  const updateTxOpts = { ...txOpts, value: 0n }
  const onApproveUSDC = async () => {
    if (!address) throw new Error('No Address')
    const hash = await usdcContract.write.approve([MultiInvoker2Addresses[chainId], MaxUint256], txOpts)
    await waitForTransactionAlert(hash)
    await refresh()
    addRecentTransaction({
      hash,
      description: copy.approveUSDC,
    })
    const newAllowance = await usdcContract.read.allowance([address, MultiInvoker2Addresses[chainId]])

    return { hash, newAllowance }
  }

  const onApproveOperator = async () => {
    if (!walletClient) return

    const hash = await vaultFactory.write.updateOperator([MultiInvoker2Addresses[chainId], true], txOpts)
    await waitForTransactionAlert(hash)
    await refresh()
    addRecentTransaction({
      hash,
      description: copy.approveShares,
    })
    return hash
  }

  const performVaultUpdate = async (baseAction: MultiInvoker2Action, txDescription: string) => {
    if (!vaultType || !address || !chainId || !walletClient || !marketOracles || !vaultSnapshots) return

    const commitments = await commitmentsForVaultAction({
      chainId,
      pyth,
      marketOracles,
      preMarketSnapshots: vaultSnapshots.vault[vaultType.vault].pre.marketSnapshots,
    })
    const actions = commitments.length ? [...commitments, baseAction] : [baseAction]

    try {
      // Extra buffer to account to changes to underlying state
      const gasLimit = await multiInvoker.estimateGas.invoke([actions], {
        ...updateTxOpts,
        value: BigInt(commitments.length),
      })
      const hash = await multiInvoker.write.invoke([actions], {
        ...updateTxOpts,
        gas: bufferGasLimit(gasLimit),
        value: BigInt(commitments.length),
      })

      // Wait for transaction to avoid race conditions in settlement
      const receipt = await waitForTransactionAlert(hash)

      await refresh()
      addRecentTransaction({
        hash,
        description: txDescription,
      })

      // Refresh after a timeout to catch missed events
      setTimeout(() => refresh(), 15000)
      setTimeout(() => refresh(), 30000)

      return receipt
    } catch (err) {
      console.error(err)
      const customError = parseViemContractCustomError(err)
      if (customError) throw customError
      throw err
    }
  }

  const onDeposit = async (amount: bigint) => {
    const updateAction = buildUpdateVault({
      vault: vaultAddress,
      deposit: amount,
      wrap: true,
    })

    return performVaultUpdate(updateAction, copy.depositCollateral)
  }

  const onRedeem = async (amount: bigint, { assets = true, max = false }) => {
    if (!vaultType || !vaultSnapshots) return

    let vaultAmount = max ? MaxUint256 : amount
    const vaultSnapshot = vaultSnapshots.vault[vaultType.vault]
    if (assets && !max) {
      vaultAmount = convertAssetsToShares({ vaultSnapshot, assets: amount })
    }
    const updateAction = buildUpdateVault({
      vault: vaultAddress,
      redeem: vaultAmount,
      wrap: true,
    })

    return performVaultUpdate(updateAction, copy.redeemCollateral)
  }

  const onClaim = async () => {
    const updateAction = buildUpdateVault({
      vault: vaultAddress,
      claim: MaxUint256,
      wrap: true,
    })

    return performVaultUpdate(updateAction, copy.claimCollateral)
  }

  return {
    onApproveUSDC,
    onApproveOperator,
    onDeposit,
    onRedeem,
    onClaim,
  }
}

const commitmentsForVaultAction = async ({
  chainId,
  pyth,
  preMarketSnapshots,
  marketOracles,
}: {
  chainId: SupportedChainId
  pyth: EvmPriceServiceConnection
  preMarketSnapshots: VaultSnapshot2['pre']['marketSnapshots']
  marketOracles: MarketOracles
}) => {
  // Commit required oracle versions for stale markets
  const now = BigInt(nowSeconds())
  const oracles = preMarketSnapshots
    .map((marketSnapshot) => {
      const priceStale =
        now - marketSnapshot.latestOracleVersion.timestamp > marketSnapshot.riskParameter.staleAfter / 2n
      const oracle = Object.values(marketOracles).find((o) => o.address === marketSnapshot.oracle)
      if (!priceStale || !oracle) return
      return oracle
    })
    .filter(notEmpty)
  const commitments = await buildCommitmentsForOracles({ chainId, pyth, marketOracles: oracles })
  return commitments.map((c) =>
    buildCommitPrice({
      oracle: c.pyth,
      version: c.version,
      index: c.index,
      vaa: c.updateData,
      revertOnFailure: false,
      value: c.value,
    }),
  )
}

const useVaultTransactionCopy = () => {
  const intl = useIntl()
  return {
    approveUSDC: intl.formatMessage({ defaultMessage: 'Approve USDC' }),
    approveDSU: intl.formatMessage({ defaultMessage: 'Approve DSU' }),
    approveShares: intl.formatMessage({ defaultMessage: 'Approve Shares' }),
    depositCollateral: intl.formatMessage({ defaultMessage: 'Deposit Collateral' }),
    redeemCollateral: intl.formatMessage({ defaultMessage: 'Redeem Collateral' }),
    claimCollateral: intl.formatMessage({ defaultMessage: 'Claim Collateral' }),
  }
}

const convertAssetsToShares = ({ vaultSnapshot, assets }: { vaultSnapshot: VaultSnapshot2; assets: bigint }) => {
  const totalAssets = Big6Math.max(vaultSnapshot.totalAssets, 0n)
  const totalShares = vaultSnapshot.totalShares
  if (totalShares === 0n) return assets
  return Big6Math.div(Big6Math.mul(assets, totalShares), totalAssets)
}
