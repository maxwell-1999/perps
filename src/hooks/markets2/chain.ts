import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Address,
  Hex,
  decodeFunctionResult,
  encodeFunctionData,
  encodePacked,
  getAddress,
  getContractAddress,
  keccak256,
  pad,
  parseEther, // eslint-disable-line no-restricted-imports
  toHex,
  zeroAddress,
} from 'viem'
import { useNetwork, useWalletClient } from 'wagmi'
import { waitForTransaction } from 'wagmi/actions'

import { useAdjustmentModalCopy } from '@/components/pages/Trade/TradeForm/components/AdjustPositionModal/hooks'
import { useTransactionToasts, useTxToastCopy } from '@/components/shared/Toast/transactionToasts'
import { MarketFactoryAddresses, MultiInvoker2Addresses } from '@/constants/contracts'
import { AssetMetadata, SupportedAsset } from '@/constants/markets'
import { PositionSide2, PositionStatus, addressToAsset2, chainAssetsWithAddress } from '@/constants/markets'
import { SupportedChainId, interfaceFeeBps, isTestnet, metamaskTxRejectedError } from '@/constants/network'
import { MaxUint256 } from '@/constants/units'
import { notEmpty, unique } from '@/utils/arrayUtils'
import { Big6Math, BigOrZero } from '@/utils/big6Utils'
import { getMarketContract, getOracleContract, getPythProviderContract } from '@/utils/contractUtils'
import { calculateFundingForSides } from '@/utils/fundingAndInterestUtils'
import { buildCommitPrice, buildInterfaceFee, buildUpdateMarket } from '@/utils/multiinvoker2'
import { calcLeverage, calcNotional, getSideFromPosition, getStatusForSnapshot } from '@/utils/positionUtils'
import { buildCommitmentsForOracles, getRecentVaa } from '@/utils/pythUtils'
import { nowSeconds } from '@/utils/timeUtils'

import { Lens2Abi } from '@abi/v2/Lens2.abi'
import { PythOracleAbi } from '@abi/v2/PythOracle.abi'

import { MultiInvoker2Action } from '@t/perennial'

import LensArtifact from '../../../lens/artifacts/contracts/Lens.sol/Lens.json'
import { useMarketFactory, useMultiInvoker2, useUSDC } from '../contracts'
import { useAddress, useChainId, usePyth, usePythSubscription, useRPCProviderUrl, useViemWsClient } from '../network'

export const useProtocolParameter = () => {
  const chainId = useChainId()
  const marketFactory = useMarketFactory()

  return useQuery({
    queryKey: ['protocolParameter2', chainId],
    enabled: !!chainId,
    queryFn: async () => {
      return marketFactory.read.parameter()
    },
  })
}

export type MarketOracles = NonNullable<ReturnType<typeof useMarketOracles2>['data']>
export const useMarketOracles2 = () => {
  const chainId = useChainId()

  return useQuery({
    queryKey: ['marketOracles2', chainId],
    queryFn: async () => {
      const markets = chainAssetsWithAddress(chainId)

      const fetchMarketOracles = async (asset: SupportedAsset, marketAddress: Address) => {
        const market = getMarketContract(marketAddress, chainId)

        const oracleAddress = await market.read.oracle()
        // Fetch oracle data
        const oracle = getOracleContract(oracleAddress, chainId)
        const [oracleCurrent] = await oracle.read.global()
        const [oracleProviderAddress] = await oracle.read.oracles([oracleCurrent])
        const oracleProviderContract = getPythProviderContract(oracleProviderAddress, chainId)
        const [oracleId, minValidTime] = await Promise.all([
          oracleProviderContract.read.id(),
          oracleProviderContract.read.MIN_VALID_TIME_AFTER_VERSION(),
        ])

        return {
          asset,
          marketAddress,
          address: oracleAddress,
          providerAddress: oracleProviderAddress,
          providerId: oracleId,
          minValidTime,
        }
      }

      const marketData = await Promise.all(
        markets.map(({ asset, marketAddress }) => {
          return fetchMarketOracles(asset as SupportedAsset, marketAddress)
        }),
      )

      return marketData.reduce((acc, market) => {
        acc[market.asset] = market
        return acc
      }, {} as Record<SupportedAsset, Awaited<ReturnType<typeof fetchMarketOracles>>>)
    },
  })
}

export type MarketSnapshot = ChainMarketSnapshot & {
  pre: ChainMarketSnapshot
  major: bigint
  majorSide: PositionSide2
  minor: bigint
  minorSide: PositionSide2
  nextMajor: bigint
  nextMajorSide: PositionSide2
  nextMinor: bigint
  nextMinorSide: PositionSide2
  fundingRate: {
    long: bigint
    short: bigint
  }
  socializationFactor: bigint
  isSocialized: boolean
}
export type UserMarketSnapshot = ChainUserMarketSnapshot & {
  pre: ChainUserMarketSnapshot
  side: PositionSide2
  nextSide: PositionSide2
  status: PositionStatus
  magnitude: bigint
  nextMagnitude: bigint
  maintenance: bigint
  nextMaintenance: bigint
  leverage: bigint
  nextLeverage: bigint
  notional: bigint
  nextNotional: bigint
}
export type MarketSnapshots = NonNullable<Awaited<ReturnType<typeof useMarketSnapshots2>>['data']>

export const useMarketSnapshots2 = (addressOverride?: Address) => {
  const chainId = useChainId()
  const { data: marketOracles } = useMarketOracles2()
  const { address: address_ } = useAddress()
  const pyth = usePyth()
  const providerUrl = useRPCProviderUrl()
  const address = addressOverride ?? address_ ?? zeroAddress

  return useQuery({
    queryKey: ['marketSnapshots2', chainId, address],
    enabled: !!address && !!marketOracles,
    queryFn: async () => {
      if (!address || !marketOracles) return

      const snapshotData = await fetchMarketSnapshotsAfterSettle(chainId, address, marketOracles, providerUrl, pyth)

      const marketSnapshots = snapshotData.market.reduce((acc, snapshot) => {
        const major = Big6Math.max(snapshot.position.long, snapshot.position.short)
        const nextMajor = Big6Math.max(snapshot.nextPosition.long, snapshot.nextPosition.short)
        const minor = Big6Math.min(snapshot.position.long, snapshot.position.short)
        const nextMinor = Big6Math.min(snapshot.nextPosition.long, snapshot.nextPosition.short)
        const fundingRates = calculateFundingForSides(snapshot)
        const socializationFactor = !Big6Math.isZero(major)
          ? Big6Math.min(Big6Math.div(minor + snapshot.nextPosition.maker, major), Big6Math.ONE)
          : Big6Math.ONE
        acc[snapshot.asset] = {
          ...snapshot,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pre: snapshotData.marketPre.find((pre) => pre.asset === snapshot.asset)!,
          major,
          majorSide: major === snapshot.position.long ? PositionSide2.long : PositionSide2.short,
          nextMajor,
          nextMajorSide: nextMajor === snapshot.nextPosition.long ? PositionSide2.long : PositionSide2.short,
          minor,
          minorSide: minor === snapshot.position.long ? PositionSide2.long : PositionSide2.short,
          nextMinor,
          nextMinorSide: nextMinor === snapshot.nextPosition.long ? PositionSide2.long : PositionSide2.short,
          fundingRate: {
            long: fundingRates.long,
            short: fundingRates.short,
          },
          socializationFactor,
          isSocialized: socializationFactor < Big6Math.ONE,
        }
        return acc
      }, {} as Record<SupportedAsset, MarketSnapshot>)
      const userSnapshots = snapshotData.user.reduce((acc, snapshot) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const pre = snapshotData.userPre.find((pre) => pre.asset === snapshot.asset)!
        const marketSnapshot = marketSnapshots[snapshot.asset]
        const marketPrice = marketSnapshot.global.latestPrice
        const latestPosition = snapshot.versions[0].valid ? snapshot.position : pre.position
        const nextPosition = snapshot.versions[0].valid ? snapshot.nextPosition : pre.nextPosition
        const side = getSideFromPosition(latestPosition)
        const nextSide = getSideFromPosition(nextPosition)
        const magnitude = side === PositionSide2.none ? 0n : latestPosition[side]
        const nextMagnitude = nextSide === PositionSide2.none ? 0n : nextPosition?.[nextSide] ?? 0n
        const hasVersionError =
          !snapshot.versions[0].valid &&
          (pre.nextPosition.timestamp < marketSnapshots[snapshot.asset].pre.latestOracleVersion.timestamp ||
            pre.nextPosition.timestamp + 60n < BigInt(Math.floor(Date.now() / 1000)))
        acc[snapshot.asset] = {
          ...snapshot,
          pre,
          side,
          nextSide,
          status: getStatusForSnapshot(magnitude, nextMagnitude, snapshot.local.collateral, hasVersionError),
          magnitude,
          nextMagnitude,
          maintenance: !Big6Math.isZero(magnitude)
            ? Big6Math.max(
                marketSnapshot.riskParameter.minMaintenance,
                Big6Math.mul(marketSnapshot.riskParameter.maintenance, calcNotional(magnitude, marketPrice)),
              )
            : 0n,
          nextMaintenance: !Big6Math.isZero(nextMagnitude)
            ? Big6Math.max(
                marketSnapshot.riskParameter.minMaintenance,
                Big6Math.mul(marketSnapshot.riskParameter.maintenance, calcNotional(nextMagnitude, marketPrice)),
              )
            : 0n,
          leverage: calcLeverage(marketPrice, magnitude, snapshot.local.collateral),
          nextLeverage: calcLeverage(marketPrice, nextMagnitude, snapshot.local.collateral),
          notional: calcNotional(magnitude, marketPrice),
          nextNotional: calcNotional(nextMagnitude, marketPrice),
        }
        return acc
      }, {} as Record<SupportedAsset, UserMarketSnapshot>)

      return {
        user: address === zeroAddress ? undefined : userSnapshots,
        market: marketSnapshots,
        commitments: snapshotData.commitments,
        updates: snapshotData.updates,
      }
    },
  })
}

export type ChainMarketSnapshot = Awaited<ReturnType<typeof fetchMarketSnapshotsAfterSettle>>['market'][number]
type ChainUserMarketSnapshot = Awaited<ReturnType<typeof fetchMarketSnapshotsAfterSettle>>['user'][number]

const fetchMarketSnapshotsAfterSettle = async (
  chainId: SupportedChainId,
  address: Address,
  marketOracles: MarketOracles,
  providerUrl: string,
  pyth: EvmPriceServiceConnection,
) => {
  const lensAddress = getContractAddress({ from: address, nonce: MaxUint256 })
  const priceCommitments = await buildCommitmentsForOracles({
    chainId,
    marketOracles: Object.values(marketOracles),
    pyth,
  })

  const marketAddresses = Object.values(marketOracles).map(({ marketAddress }) => marketAddress)

  const ethCallPayload = {
    to: lensAddress,
    from: address,
    data: encodeFunctionData({
      abi: Lens2Abi,
      functionName: 'snapshot',
      args: [priceCommitments, marketAddresses, address],
    }),
  }

  // Update marketFactory operator storage to allow lens to update address
  // Operator storage mapping is at index 1
  const operatorStorage = keccak256(encodePacked(['bytes32', 'bytes32'], [pad(address), toHex(1n, { size: 32 })]))
  const operatorStorageIndex = keccak256(encodePacked(['bytes32', 'bytes32'], [pad(lensAddress), operatorStorage]))
  const alchemyRes = await fetch(providerUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_call', // use a manual eth_call here to use state overrides
      params: [
        ethCallPayload,
        'latest',
        {
          // state diff overrides
          [lensAddress]: {
            code: LensArtifact.deployedBytecode,
            balance: toHex(parseEther('1000')),
          },
          [MarketFactoryAddresses[chainId]]: {
            stateDiff: {
              [operatorStorageIndex]: pad(toHex(true)), // Set the deployed lens as an approved operator
            },
          },
        },
      ],
    }),
  })
  const batchRes = (await alchemyRes.json()) as { result: Hex }
  const lensRes = decodeFunctionResult({ abi: Lens2Abi, functionName: 'snapshot', data: batchRes.result })

  return {
    commitments: lensRes.commitmentStatus,
    updates: lensRes.updateStatus,
    market: lensRes.postUpdate.marketSnapshots
      .map((s) => {
        const asset = addressToAsset2(getAddress(s.market))
        if (!asset) return
        return {
          ...s,
          asset,
        }
      })
      .filter(notEmpty),
    marketPre: lensRes.preUpdate.marketSnapshots
      .map((s) => {
        const asset = addressToAsset2(getAddress(s.market))
        if (!asset) return
        return {
          ...s,
          asset,
        }
      })
      .filter(notEmpty),
    user: lensRes.postUpdate.marketAccountSnapshots
      .map((s) => {
        const asset = addressToAsset2(getAddress(s.market))
        if (!asset) return
        return {
          ...s,
          asset,
        }
      })
      .filter(notEmpty),
    userPre: lensRes.preUpdate.marketAccountSnapshots
      .map((s) => {
        const asset = addressToAsset2(getAddress(s.market))
        if (!asset) return
        return {
          ...s,
          asset,
        }
      })
      .filter(notEmpty),
  }
}

export const useMarketTransactions2 = (productAddress: Address) => {
  const { chain } = useNetwork()
  const chainId = useChainId()
  const errorToastCopy = useTxToastCopy()
  const { triggerErrorToast } = useTransactionToasts()

  const { address } = useAddress()
  const { data: walletClient } = useWalletClient()
  const { data: marketOracles } = useMarketOracles2()
  const { data: marketSnapshots } = useMarketSnapshots2()
  const pyth = usePyth()
  const copy = useAdjustmentModalCopy()
  const addRecentTransaction = useAddRecentTransaction()

  const multiInvoker = useMultiInvoker2(walletClient ?? undefined)
  const usdcContract = useUSDC(walletClient ?? undefined)

  const queryClient = useQueryClient()
  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          ['marketSnapshots2', 'marketPnls2', 'balances'].includes(queryKey.at(0) as string) &&
          queryKey.includes(chainId),
      }),
    [queryClient, chainId],
  )

  const txOpts = { account: address || zeroAddress, chainId, chain }
  const onApproveUSDC = async (suggestedAmount: bigint = MaxUint256) => {
    if (!address) throw new Error('No Address')
    const hash = await usdcContract.write.approve(
      [MultiInvoker2Addresses[chainId], Big6Math.abs(suggestedAmount)],
      txOpts,
    )
    await waitForTransaction({ hash })
    await refresh()
    addRecentTransaction({
      hash,
      description: copy.approveUSDC,
    })
    const newAllowance = await usdcContract.read.allowance([address, MultiInvoker2Addresses[chainId]])
    return { hash, newAllowance }
  }

  const onModifyPosition = async ({
    positionSide,
    positionAbs,
    collateralDelta,
    txHistoryLabel,
    interfaceFee,
  }: {
    txHistoryLabel?: string
    collateralDelta?: bigint
    positionAbs?: bigint
    positionSide?: PositionSide2
    interfaceFee?: bigint
  } = {}) => {
    if (!address || !chainId || !walletClient || !marketOracles || !pyth) {
      return
    }

    const oracleInfo = Object.values(marketOracles).find((o) => o.marketAddress === productAddress)
    if (!oracleInfo) return
    const asset = addressToAsset2(productAddress)

    // Interface fee
    const interfaceFeeInfo = interfaceFeeBps[chainId]
    let chargeFeeAction
    if (interfaceFee && interfaceFeeInfo && interfaceFeeInfo.feeRecipientAddress !== zeroAddress) {
      chargeFeeAction = buildInterfaceFee({
        to: interfaceFeeInfo.feeRecipientAddress,
        amount: interfaceFee,
      })
    }

    const updateAction = buildUpdateMarket({
      market: productAddress,
      maker: positionSide === PositionSide2.maker ? positionAbs : undefined, // Absolute position size
      long: positionSide === PositionSide2.long ? positionAbs : undefined,
      short: positionSide === PositionSide2.short ? positionAbs : undefined,
      collateral: (collateralDelta ?? 0n) - (interfaceFee ?? 0n), // Delta collateral
      wrap: true,
    })

    const actions: MultiInvoker2Action[] = [updateAction, chargeFeeAction].filter(notEmpty)

    let isPriceStale = false
    if (asset && marketSnapshots?.market[asset]) {
      const {
        parameter: { maxPendingGlobal, maxPendingLocal },
        riskParameter: { staleAfter },
        pendingPositions,
      } = marketSnapshots.market[asset]
      const lastUpdated = await getOracleContract(oracleInfo.address, chainId).read.latest()
      isPriceStale = BigInt(nowSeconds()) - lastUpdated.timestamp > staleAfter / 2n
      // If there is a backlog of pending positions, we need to commit the price
      isPriceStale = isPriceStale || BigInt(pendingPositions.length) >= maxPendingGlobal
      // If there is a backlog of pending positions for this user, we need to commit the price
      isPriceStale =
        isPriceStale || BigOrZero(marketSnapshots.user?.[asset]?.pendingPositions?.length) >= maxPendingLocal
    }

    // Only add the price commit if the price is stale
    if (isPriceStale) {
      const [{ version, index, value, updateData }] = await buildCommitmentsForOracles({
        chainId,
        pyth,
        marketOracles: [oracleInfo],
        onError: () => triggerErrorToast({ title: errorToastCopy.error, message: errorToastCopy.errorFetchingPrice }),
      })

      const commitAction = buildCommitPrice({
        oracle: oracleInfo.providerAddress,
        version,
        value,
        index,
        vaa: updateData,
        revertOnFailure: false,
      })

      actions.unshift(commitAction)
    }

    try {
      const hash = await multiInvoker.write.invoke([actions], { ...txOpts, value: 1n })
      waitForTransaction({ hash })
        .then(() => refresh())
        .catch(() => null)
      addRecentTransaction({
        hash,
        description: txHistoryLabel || copy.positionChanged,
      })
      // Refresh after a timeout to catch missed events
      setTimeout(() => refresh(), 15000)
      setTimeout(() => refresh(), 30000)
      // TODO: non-blocking waitForTransaction and show an error if the tx reverts on chain
      return hash
    } catch (err: any) {
      // Ignore metamask tx rejected error
      if (err.details !== metamaskTxRejectedError) {
        triggerErrorToast({ title: errorToastCopy.error, message: errorToastCopy.errorPlacingOrder })
      }

      console.error(err)
    }
  }

  const onSubmitVaa = async () => {
    if (!address || !chainId || !walletClient || !marketOracles || !pyth) {
      return
    }

    const oracleInfo = Object.values(marketOracles).find((o) => o.marketAddress === productAddress)
    if (!oracleInfo) return

    const [{ version, vaa }] = await getRecentVaa({
      pyth,
      feeds: [oracleInfo],
    })

    try {
      const oracleProvider = getPythProviderContract(oracleInfo.providerAddress, chainId, walletClient)
      const hash = await oracleProvider.write.commit(
        [await oracleProvider.read.versionListLength(), version, vaa as Hex],
        { ...txOpts, value: 1n },
      )
      await waitForTransaction({ hash })
        .then(() => refresh())
        .catch(() => null)
      return hash
    } catch (err: any) {
      // Ignore metamask tx rejected error
      if (err.details !== metamaskTxRejectedError) {
        triggerErrorToast({ title: errorToastCopy.error, message: errorToastCopy.errorPlacingOrder })
      }

      console.error(err)
    }
  }

  return {
    onApproveUSDC,
    onModifyPosition,
    onSubmitVaa,
  }
}

export const useChainLivePrices2 = () => {
  const chain = useChainId()
  const markets = chainAssetsWithAddress(chain)
  const [prices, setPrices] = useState<{ [key in SupportedAsset]?: bigint }>({})
  const feedKey = isTestnet(chain) ? 'pythFeedIdTestnet' : 'pythFeedId'

  const [feedIds, feedToAsset] = useMemo(() => {
    const feedToAsset = markets.reduce((acc, { asset }) => {
      const feed = AssetMetadata[asset][feedKey]
      if (!feed) return acc
      if (acc[feed]) {
        acc[feed].push(asset)
      } else {
        acc[feed] = [asset]
      }
      return acc
    }, {} as { [key: string]: SupportedAsset[] })

    const feedIds = Object.keys(feedToAsset)

    return [feedIds, feedToAsset]
  }, [markets, feedKey])

  const feedSubscription = usePythSubscription(feedIds)
  const onUpdate = useCallback(
    (priceFeed: PriceFeed) => {
      const price = priceFeed.getPriceNoOlderThan(60)
      const normalizedExpo = price ? 6 + price?.expo : 0
      const normalizedPrice =
        normalizedExpo >= 0
          ? BigOrZero(price?.price) * 10n ** BigInt(normalizedExpo)
          : BigOrZero(price?.price) / 10n ** BigInt(Math.abs(normalizedExpo))
      setPrices((prices) => ({
        ...prices,
        ...feedToAsset['0x' + priceFeed.id].reduce((acc, asset) => {
          const { transform } = AssetMetadata[asset]
          // Pyth price is has `expo` (negative number) decimals, normalize to expected 18 decimals by multiplying by 10^(18 + expo)
          acc[asset] = price ? transform(normalizedPrice) : undefined
          return acc
        }, {} as { [key in SupportedAsset]?: bigint }),
      }))
    },
    [feedToAsset],
  )

  useEffect(() => {
    feedSubscription.on('updates', onUpdate)

    return () => {
      feedSubscription.off('updates', onUpdate)
    }
  }, [feedSubscription, onUpdate])

  return prices
}

export type LivePrices = Awaited<ReturnType<typeof useChainLivePrices2>>

const RefreshKeys = ['marketSnapshots2', 'marketPnls2']
export const useRefreshKeysOnPriceUpdates2 = (invalidKeys: string[] = RefreshKeys) => {
  const chainId = useChainId()
  const queryClient = useQueryClient()
  const { data: marketOracles, isPreviousData } = useMarketOracles2()
  const wsClient = useViemWsClient()

  const refresh = useCallback(() => {
    return queryClient.invalidateQueries({
      predicate: ({ queryKey }) => invalidKeys.includes(queryKey.at(0) as string) && queryKey.includes(chainId),
    })
  }, [invalidKeys, queryClient, chainId])

  const oracleProviders = useMemo(() => {
    if (!marketOracles || isPreviousData) return []
    return unique(Object.values(marketOracles).flatMap((p) => p.providerAddress))
  }, [marketOracles, isPreviousData])

  useEffect(() => {
    if (!oracleProviders.length) return
    const unwatchFns = oracleProviders.map((a) => {
      return [
        wsClient.watchContractEvent({
          address: a,
          abi: PythOracleAbi,
          eventName: 'OracleProviderVersionRequested',
          onLogs: () => refresh(),
        }),

        wsClient.watchContractEvent({
          address: a,
          abi: PythOracleAbi,
          eventName: 'OracleProviderVersionFulfilled',
          onLogs: () => refresh(),
        }),
      ]
    })
    return () => unwatchFns.flat().forEach((unwatch) => unwatch())
  }, [oracleProviders, refresh, wsClient])
}
