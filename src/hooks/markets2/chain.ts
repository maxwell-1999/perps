import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { useQuery } from '@tanstack/react-query'
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

import { MarketFactoryAddresses } from '@/constants/contracts'
import { SupportedAsset } from '@/constants/markets'
import { PositionSide2, PositionStatus, addressToAsset2, chainAssetsWithAddress } from '@/constants/markets'
import { SupportedChainId } from '@/constants/network'
import { MaxUint256 } from '@/constants/units'
import { useGlobalErrorContext } from '@/contexts/globalErrorContext'
import { notEmpty } from '@/utils/arrayUtils'
import { Big6Math } from '@/utils/big6Utils'
import { getMarketContract, getOracleContract, getPythProviderContract } from '@/utils/contractUtils'
import { calculateFundingForSides } from '@/utils/fundingAndInterestUtils'
import { calcLeverage, calcNotional, getSideFromPosition, getStatusForSnapshot } from '@/utils/positionUtils'
import { buildCommitmentsForOracles } from '@/utils/pythUtils'

import { Lens2Abi } from '@abi/v2/Lens2.abi'

import LensArtifact from '../../../lens/artifacts/contracts/Lens.sol/Lens.json'
import { useMarketFactory } from '../contracts'
import { useAddress, useChainId, usePyth, useRPCProviderUrl } from '../network'

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
    maker: bigint
  }
  socializationFactor: bigint
  isSocialized: boolean
}
export type UserMarketSnapshot = ChainUserMarketSnapshot & {
  pre: Omit<ChainUserMarketSnapshot, 'priceUpdate'>
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
  priceUpdate: Address
}
export type MarketSnapshots = NonNullable<Awaited<ReturnType<typeof useMarketSnapshots2>>['data']>

export const useMarketSnapshots2 = (addressOverride?: Address) => {
  const chainId = useChainId()
  const { data: marketOracles } = useMarketOracles2()
  const { address: address_ } = useAddress()
  const pyth = usePyth()
  const providerUrl = useRPCProviderUrl()
  const address = addressOverride ?? address_ ?? zeroAddress
  const { onPythError, resetPythError } = useGlobalErrorContext()

  return useQuery({
    queryKey: ['marketSnapshots2', chainId, address],
    enabled: !!address && !!marketOracles,
    queryFn: async () => {
      if (!address || !marketOracles) return

      const snapshotData = await fetchMarketSnapshotsAfterSettle(
        chainId,
        address,
        marketOracles,
        providerUrl,
        pyth,
        onPythError,
        resetPythError,
      )

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
            maker: fundingRates.maker,
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
        const priceUpdate = snapshot?.priceUpdate
        const hasVersionError =
          !snapshot.versions[0].valid &&
          (pre.nextPosition.timestamp < marketSnapshots[snapshot.asset].pre.latestOracleVersion.timestamp ||
            pre.nextPosition.timestamp + 60n < BigInt(Math.floor(Date.now() / 1000)))
        acc[snapshot.asset] = {
          ...snapshot,
          pre,
          side,
          nextSide,
          status: getStatusForSnapshot(
            magnitude,
            nextMagnitude,
            snapshot.local.collateral,
            hasVersionError,
            priceUpdate,
          ),
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
  onPythError: () => void,
  resetPythError: () => void,
) => {
  const lensAddress = getContractAddress({ from: address, nonce: MaxUint256 })
  const priceCommitments = await buildCommitmentsForOracles({
    chainId,
    marketOracles: Object.values(marketOracles),
    pyth,
    onError: onPythError,
    onSuccess: resetPythError,
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
      .map((s, i) => {
        const asset = addressToAsset2(getAddress(s.market))
        if (!asset) return
        return {
          ...s,
          asset,
          priceUpdate: lensRes.updateStatus[i],
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
