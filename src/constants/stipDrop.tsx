/* eslint-disable formatjs/no-literal-string-in-jsx */
import { Flex } from '@chakra-ui/react'
import { Address, getAddress } from 'viem'

import { DataRow } from '@/components/design-system'
import { TooltipIcon } from '@/components/design-system/Tooltip'
import { MarketSnapshots } from '@/hooks/markets2'
import { VaultSnapshot2 } from '@/hooks/vaults2'
import { sum } from '@/utils/arrayUtils'
import { Big6Math, formatBig6 } from '@/utils/big6Utils'
import { calcNotional } from '@/utils/positionUtils'

import { SupportedAsset } from './markets'
import { PerennialVaultType } from './vaults'

export type STIPSeasonNumber = keyof typeof STIPDropParams

const noOpEstimate = (_: MarketSnapshots, __?: bigint) => 0n

export const STIPDropParams = {
  // 2023-11-06T12:00:00Z - 2023-11-13T12:00:00Z
  1: {
    from: new Date(1699272000 * 1000),
    to: new Date(1699876800 * 1000),
    fromBlock: 147687900,
    get over() {
      return Date.now() > this.to.getTime()
    },
    taker: {
      tooltip: undefined,
      feeTooltip: undefined,
      leaderboardPnlTooltip: undefined,
      leaderboardVolumeTooltip: undefined,
      totalOIRewards: Big6Math.fromFloatString('23437.5'),
      feeRebatePct: Big6Math.fromFloatString('1'),
      totalFeeRewards: Big6Math.fromFloatString('23437.5'),
      totalPnlRewards: 0n,
      totalVolumeRewards: 0n,
      estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
        return sum([
          notionalDelta ?? 0n,
          ...Object.values(snapshots.market).map(
            (s) =>
              calcNotional(s.nextPosition.long, s.latestOracleVersion.price) +
              calcNotional(s.nextPosition.short, s.latestOracleVersion.price),
          ),
        ])
      },
    },
    maker: {
      get tooltip() {
        const ethBtcMaker = ((this.eth?.totalOIRewards ?? 0n) + (this.btc?.totalOIRewards ?? 0n)) / 2n
        const solMaticMaker = ((this.sol?.totalOIRewards ?? 0n) + (this.matic?.totalOIRewards ?? 0n)) / 2n
        const otherMaker = ((this.tia?.totalOIRewards ?? 0n) + (this.rlb?.totalOIRewards ?? 0n)) / 2n
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="ETH/BTC" value={`${formatBig6(ethBtcMaker)} ARB (60%)`} />
                <DataRow label="SOL/MATIC" value={`${formatBig6(solMaticMaker)} ARB (30%)`} />
                <DataRow label="Other" value={`${formatBig6(otherMaker)} ARB (10%)`} mb={0} />
              </Flex>
            }
          />
        )
      },
      get totalOIRewards() {
        return sum([
          ((this.eth?.totalOIRewards ?? 0n) + (this.btc?.totalOIRewards ?? 0n)) / 2n,
          ((this.sol?.totalOIRewards ?? 0n) + (this.matic?.totalOIRewards ?? 0n)) / 2n,
          ((this.tia?.totalOIRewards ?? 0n) + (this.rlb?.totalOIRewards ?? 0n)) / 2n,
        ])
      },
      [SupportedAsset.eth]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            calcNotional(snapshots.market.eth.nextPosition.maker, snapshots.market.eth.latestOracleVersion.price),
            calcNotional(snapshots.market.btc.nextPosition.maker, snapshots.market.btc.latestOracleVersion.price),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('2343.8'), // Split between ETH and BTC
      },
      [SupportedAsset.btc]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            calcNotional(snapshots.market.eth.nextPosition.maker, snapshots.market.eth.latestOracleVersion.price),
            calcNotional(snapshots.market.btc.nextPosition.maker, snapshots.market.btc.latestOracleVersion.price),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('2343.8'), // Split between ETH and BTC
      },
      [SupportedAsset.sol]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            calcNotional(snapshots.market.sol.nextPosition.maker, snapshots.market.sol.latestOracleVersion.price),
            calcNotional(snapshots.market.matic.nextPosition.maker, snapshots.market.matic.latestOracleVersion.price),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('1171.9'), // Split between SOL and MATIC
      },
      [SupportedAsset.matic]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            calcNotional(snapshots.market.sol.nextPosition.maker, snapshots.market.sol.latestOracleVersion.price),
            calcNotional(snapshots.market.matic.nextPosition.maker, snapshots.market.matic.latestOracleVersion.price),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('1171.9'), // Split between SOL and MATIC
      },
      [SupportedAsset.tia]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            calcNotional(snapshots.market.tia.nextPosition.maker, snapshots.market.tia.latestOracleVersion.price),
            calcNotional(snapshots.market.rlb.nextPosition.maker, snapshots.market.rlb.latestOracleVersion.price),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('390.6'),
      },
      [SupportedAsset.rlb]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            calcNotional(snapshots.market.tia.nextPosition.maker, snapshots.market.tia.latestOracleVersion.price),
            calcNotional(snapshots.market.rlb.nextPosition.maker, snapshots.market.rlb.latestOracleVersion.price),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('390.6'),
      },
      [SupportedAsset.link]: { estimatedOI: noOpEstimate, totalOIRewards: 0n },
      [SupportedAsset.bnb]: { estimatedOI: noOpEstimate, totalOIRewards: 0n },
      [SupportedAsset.arb]: { estimatedOI: noOpEstimate, totalOIRewards: 0n },
    },
    vault: {
      get tooltip() {
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="Blue Chip Vault" value={`${formatBig6(this.alpha.totalOIRewards)} ARB (75%)`} />
                <DataRow label="Large Cap Vault" value={`${formatBig6(this.bravo.totalOIRewards)} ARB (25%)`} mb={0} />
              </Flex>
            }
          />
        )
      },
      get totalOIRewards() {
        return sum([this.alpha.totalOIRewards, this.bravo.totalOIRewards])
      },
      [PerennialVaultType.alpha]: {
        estimatedOI: (snapshot: VaultSnapshot2, notionalDelta?: bigint) => {
          return snapshot.totalAssets + (notionalDelta ?? 0n)
        },
        totalOIRewards: Big6Math.fromFloatString('8789'),
      },
      [PerennialVaultType.bravo]: {
        estimatedOI: (snapshot: VaultSnapshot2, notionalDelta?: bigint) => {
          return snapshot.totalAssets + (notionalDelta ?? 0n)
        },
        totalOIRewards: Big6Math.fromFloatString('2929.7'),
      },
    },
    get totalRewards() {
      return sum([
        this.taker.totalOIRewards,
        this.taker.totalFeeRewards,
        this.maker.totalOIRewards,
        this.vault.totalOIRewards,
      ])
    },
    blobUrl: process.env.NEXT_PUBLIC_STIP_BLOB_URL_SEASON_1,
    sybils: [
      '0x235cf972e3c6d1df059b645f4b0ed20be4326c61',
      '0x43938b4f7ee6b85b6f38eec06addfa85404093ba',
      '0x385ffed8031891044f87bdd10a308080417181fe',
      '0xf36ca34a56c57464a7d58d268d96b23d07f408e0',
      '0x23c518823e80e2cca8ad16e8e9cb92e5d578c594',
      '0x4e661bb7022c2f1703621bb5965c3c924eb5842c',
      '0xcecfd0d30cb5362af3c7378401ad9437c4c15815',
      '0xd6707b918ae2d1b802e6aa8b05e2d04a3ed2f53f',
      '0x56cce05526af66f69bddaa54a60dc9c9ca5411ad',
      '0x647220b5e407cfb58f0db4170410914ba87ee17f',
      '0x98289029b0d4bb73ead9eb1a3300ed724fcf6779',
      '0xb0db0a18ba8309b66aa54ea5bb55f4f457ca3ea8',
      '0x3c7d0889937dbbd80a674bab7124be2712cb6ec0',
      '0x7455898a8f461ceb5510c3f264b7290499501b5b',
      '0x04001c5359ec93b3368af1c8f0d5510506ece41b',
      '0x9b4c436f40e7fbae7bad8b7547a2e8652c71b6c5',
      '0x42e3da8e7c1dbff7f9fe544fff5c4531ecd6f8a4',
      '0xa73ce2d80a75773ea90367015b60a0a3624818d7',
      '0x28b539234c12cb8df634c4311cf2abceb662f6d3',
      '0xbeb439195367d87184733badb1f4f26a7df9c576',
    ].map((s) => getAddress(s)) as Address[],
  },
  // 2023-11-13T12:00:00Z - 2023-11-20T12:00:00Z
  2: {
    from: new Date(1699876800 * 1000),
    to: new Date(1700481600 * 1000),
    fromBlock: 149992899,
    get over() {
      return Date.now() > this.to.getTime()
    },
    taker: {
      feeRebatePct: Big6Math.fromFloatString('1'),
      totalFeeRewards: Big6Math.fromFloatString('18750'),
      totalPnlRewards: 0n,
      totalVolumeRewards: 0n,
      get totalOIRewards() {
        const ethBtcTaker = sum([this.eth?.totalOIRewards ?? 0n, this.btc?.totalOIRewards ?? 0n]) / 2n
        const otherTaker = this.sol?.totalOIRewards ?? 0n
        return ethBtcTaker + otherTaker
      },
      get tooltip() {
        const ethBtcTaker = this.totalOIRewards / 2n
        const otherTaker = this.totalOIRewards / 2n
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="ETH/BTC" value={`${formatBig6(ethBtcTaker)} ARB (50%)`} />
                <DataRow label="Other" value={`${formatBig6(otherTaker)} ARB (50%)`} />
              </Flex>
            }
          />
        )
      },
      get feeTooltip() {
        const ethBtcTakerFees = this.totalFeeRewards / 2n
        const otherTakerFees = this.totalFeeRewards / 2n
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="ETH/BTC" value={`${formatBig6(ethBtcTakerFees)} ARB (50%)`} />
                <DataRow label="Other" value={`${formatBig6(otherTakerFees)} ARB (50%)`} />
              </Flex>
            }
          />
        )
      },
      leaderboardPnlTooltip: undefined,
      leaderboardVolumeTooltip: undefined,
      [SupportedAsset.eth]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            calcNotional(
              snapshots.market.eth.nextPosition.long + snapshots.market.eth.nextPosition.short,
              snapshots.market.eth.latestOracleVersion.price,
            ),
            calcNotional(
              snapshots.market.btc.nextPosition.long + snapshots.market.btc.nextPosition.short,
              snapshots.market.btc.latestOracleVersion.price,
            ),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('9375'), // Split between ETH and BTC
      },
      get [SupportedAsset.btc]() {
        return this.eth
      },
      [SupportedAsset.sol]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            ...Object.entries(snapshots.market)
              .filter(([asset]) => asset !== SupportedAsset.eth && asset !== SupportedAsset.btc)
              .map(([, ss]) =>
                calcNotional(ss.nextPosition.long + ss.nextPosition.short, ss.latestOracleVersion.price),
              ),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('9375'), // Split between OTHER
      },
      get [SupportedAsset.matic]() {
        return this.sol
      },
      get [SupportedAsset.tia]() {
        return this.sol
      },
      get [SupportedAsset.rlb]() {
        return this.sol
      },
      get [SupportedAsset.link]() {
        return this.sol
      },
      [SupportedAsset.bnb]: { estimatedOI: noOpEstimate, totalOIRewards: 0n },
      [SupportedAsset.arb]: { estimatedOI: noOpEstimate, totalOIRewards: 0n },
    },
    maker: {
      get tooltip() {
        const ethBtcMaker = this.totalOIRewards / 2n
        const otherMaker = this.totalOIRewards / 2n
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="ETH/BTC" value={`${formatBig6(ethBtcMaker)} ARB (50%)`} />
                <DataRow label="Other" value={`${formatBig6(otherMaker)} ARB (50%)`} mb={0} />
              </Flex>
            }
          />
        )
      },
      get totalOIRewards() {
        const ethBtcMaker = sum([this.eth?.totalOIRewards ?? 0n, this.btc?.totalOIRewards ?? 0n]) / 2n
        const otherMaker = this.sol?.totalOIRewards ?? 0n
        return ethBtcMaker + otherMaker
      },
      [SupportedAsset.eth]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            calcNotional(snapshots.market.eth.nextPosition.maker, snapshots.market.eth.latestOracleVersion.price),
            calcNotional(snapshots.market.btc.nextPosition.maker, snapshots.market.btc.latestOracleVersion.price),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('3125'), // Split between ETH and BTC
      },
      get [SupportedAsset.btc]() {
        return this.eth
      },
      [SupportedAsset.sol]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            ...Object.entries(snapshots.market)
              .filter(([asset]) => asset !== SupportedAsset.eth && asset !== SupportedAsset.btc)
              .map(([, ss]) => calcNotional(ss.nextPosition.maker, ss.latestOracleVersion.price)),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('3125'), // Split between OTHER
      },
      get [SupportedAsset.matic]() {
        return this.sol
      },
      get [SupportedAsset.tia]() {
        return this.sol
      },
      get [SupportedAsset.rlb]() {
        return this.sol
      },
      get [SupportedAsset.link]() {
        return this.sol
      },
      [SupportedAsset.bnb]: { estimatedOI: noOpEstimate, totalOIRewards: 0n },
      [SupportedAsset.arb]: { estimatedOI: noOpEstimate, totalOIRewards: 0n },
    },
    vault: {
      get tooltip() {
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="Blue Chip Vault" value={`${formatBig6(this.alpha.totalOIRewards)} ARB (50%)`} />
                <DataRow label="Large Cap Vault" value={`${formatBig6(this.bravo.totalOIRewards)} ARB (50%)`} mb={0} />
              </Flex>
            }
          />
        )
      },
      get totalOIRewards() {
        return sum([this.alpha.totalOIRewards, this.bravo.totalOIRewards])
      },
      [PerennialVaultType.alpha]: {
        estimatedOI: (snapshot: VaultSnapshot2, notionalDelta?: bigint) => {
          return snapshot.totalAssets + (notionalDelta ?? 0n)
        },
        totalOIRewards: Big6Math.fromFloatString('9375'),
      },
      [PerennialVaultType.bravo]: {
        estimatedOI: (snapshot: VaultSnapshot2, notionalDelta?: bigint) => {
          return snapshot.totalAssets + (notionalDelta ?? 0n)
        },
        totalOIRewards: Big6Math.fromFloatString('9375'),
      },
    },
    get totalRewards() {
      return sum([
        this.taker.totalOIRewards,
        this.taker.totalFeeRewards,
        this.maker.totalOIRewards,
        this.vault.totalOIRewards,
      ])
    },
    blobUrl:
      'https://yrj8qjpysmcjwwy4.public.blob.vercel-storage.com/season-2-rewards-final-su6NwBPNVThBrFdJYUNUruZKrtzVMU.json',
    sybils: [] as Address[],
  },

  // 2023-11-20T12:00:00Z - 2023-12-04T12:00:00Z
  3: {
    from: new Date(1700481600 * 1000),
    to: new Date(1701691200 * 1000),
    fromBlock: 152277893, // TODO: estimate, update after start
    get over() {
      return Date.now() > this.to.getTime()
    },
    taker: {
      feeRebatePct: Big6Math.fromFloatString('1'),
      totalFeeRewards: Big6Math.fromFloatString('31875'),
      totalPnlRewards: Big6Math.fromFloatString('20000'),
      totalVolumeRewards: Big6Math.fromFloatString('20000'),
      get totalOIRewards() {
        const ethBtcTaker = this.eth?.totalOIRewards ?? 0n
        const otherTaker = this.sol?.totalOIRewards ?? 0n
        return ethBtcTaker + otherTaker
      },
      get tooltip() {
        const ethBtcTaker = this.totalOIRewards / 2n
        const otherTaker = this.totalOIRewards / 2n
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="ETH/BTC" value={`${formatBig6(ethBtcTaker)} ARB (50%)`} />
                <DataRow label="Other" value={`${formatBig6(otherTaker)} ARB (50%)`} />
              </Flex>
            }
          />
        )
      },
      get feeTooltip() {
        const ethBtcTakerFees = this.totalFeeRewards / 2n
        const otherTakerFees = this.totalFeeRewards / 2n
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="ETH/BTC" value={`${formatBig6(ethBtcTakerFees)} ARB (50%)`} />
                <DataRow label="Other" value={`${formatBig6(otherTakerFees)} ARB (50%)`} />
              </Flex>
            }
          />
        )
      },
      get leaderboardPnlTooltip() {
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="1st" value="9,000 ARB" />
                <DataRow label="2nd" value="5,000 ARB" />
                <DataRow label="3rd" value="3,000 ARB" />
                <DataRow label="4th" value="2,000 ARB" />
                <DataRow label="5th" value="1,000 ARB" />
              </Flex>
            }
          />
        )
      },
      get leaderboardVolumeTooltip() {
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="1st" value="9,000 ARB" />
                <DataRow label="2nd" value="5,000 ARB" />
                <DataRow label="3rd" value="3,000 ARB" />
                <DataRow label="4th" value="2,000 ARB" />
                <DataRow label="5th" value="1,000 ARB" />
              </Flex>
            }
          />
        )
      },
      [SupportedAsset.eth]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            calcNotional(
              snapshots.market.eth.nextPosition.long + snapshots.market.eth.nextPosition.short,
              snapshots.market.eth.latestOracleVersion.price,
            ),
            calcNotional(
              snapshots.market.btc.nextPosition.long + snapshots.market.btc.nextPosition.short,
              snapshots.market.btc.latestOracleVersion.price,
            ),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('5312.5'), // Split between ETH and BTC
      },
      get [SupportedAsset.btc]() {
        return this.eth
      },
      [SupportedAsset.sol]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            ...Object.entries(snapshots.market)
              .filter(([asset]) => asset !== SupportedAsset.eth && asset !== SupportedAsset.btc)
              .map(([, ss]) =>
                calcNotional(ss.nextPosition.long + ss.nextPosition.short, ss.latestOracleVersion.price),
              ),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('5312.5'), // Split between OTHER
      },
      get [SupportedAsset.matic]() {
        return this.sol
      },
      get [SupportedAsset.tia]() {
        return this.sol
      },
      get [SupportedAsset.rlb]() {
        return this.sol
      },
      get [SupportedAsset.link]() {
        return this.sol
      },
      get [SupportedAsset.bnb]() {
        return this.sol
      },
      [SupportedAsset.arb]: { estimatedOI: noOpEstimate, totalOIRewards: 0n },
    },
    maker: {
      get tooltip() {
        const ethBtcMaker = this.totalOIRewards / 2n
        const otherMaker = this.totalOIRewards / 2n
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="ETH/BTC" value={`${formatBig6(ethBtcMaker)} ARB (50%)`} />
                <DataRow label="Other" value={`${formatBig6(otherMaker)} ARB (50%)`} mb={0} />
              </Flex>
            }
          />
        )
      },
      get totalOIRewards() {
        const ethBtcMaker = sum([this.eth?.totalOIRewards ?? 0n, this.btc?.totalOIRewards ?? 0n]) / 2n
        const otherMaker = this.sol?.totalOIRewards ?? 0n
        return ethBtcMaker + otherMaker
      },
      [SupportedAsset.eth]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            calcNotional(snapshots.market.eth.nextPosition.maker, snapshots.market.eth.latestOracleVersion.price),
            calcNotional(snapshots.market.btc.nextPosition.maker, snapshots.market.btc.latestOracleVersion.price),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('5312.5'), // Split between ETH and BTC
      },
      get [SupportedAsset.btc]() {
        return this.eth
      },
      [SupportedAsset.sol]: {
        estimatedOI: (snapshots: MarketSnapshots, notionalDelta?: bigint) => {
          return sum([
            notionalDelta ?? 0n,
            ...Object.entries(snapshots.market)
              .filter(([asset]) => asset !== SupportedAsset.eth && asset !== SupportedAsset.btc)
              .map(([, ss]) => calcNotional(ss.nextPosition.maker, ss.latestOracleVersion.price)),
          ])
        },
        totalOIRewards: Big6Math.fromFloatString('5312.5'), // Split between OTHER
      },
      get [SupportedAsset.matic]() {
        return this.sol
      },
      get [SupportedAsset.tia]() {
        return this.sol
      },
      get [SupportedAsset.rlb]() {
        return this.sol
      },
      get [SupportedAsset.link]() {
        return this.sol
      },
      get [SupportedAsset.bnb]() {
        return this.sol
      },
      [SupportedAsset.arb]: { estimatedOI: noOpEstimate, totalOIRewards: 0n },
    },
    vault: {
      get tooltip() {
        return (
          <TooltipIcon
            tooltipText={
              <Flex flexDirection="column" width="200px">
                <DataRow label="Blue Chip Vault" value={`${formatBig6(this.alpha.totalOIRewards)} ARB (50%)`} />
                <DataRow label="Large Cap Vault" value={`${formatBig6(this.bravo.totalOIRewards)} ARB (50%)`} mb={0} />
              </Flex>
            }
          />
        )
      },
      get totalOIRewards() {
        return sum([this.alpha.totalOIRewards, this.bravo.totalOIRewards])
      },
      [PerennialVaultType.alpha]: {
        estimatedOI: (snapshot: VaultSnapshot2, notionalDelta?: bigint) => {
          return snapshot.totalAssets + (notionalDelta ?? 0n)
        },
        totalOIRewards: Big6Math.fromFloatString('15937.5'),
      },
      [PerennialVaultType.bravo]: {
        estimatedOI: (snapshot: VaultSnapshot2, notionalDelta?: bigint) => {
          return snapshot.totalAssets + (notionalDelta ?? 0n)
        },
        totalOIRewards: Big6Math.fromFloatString('15937.5'),
      },
    },
    get totalRewards() {
      return sum([
        this.taker.totalOIRewards,
        this.taker.totalFeeRewards,
        this.taker.totalPnlRewards,
        this.taker.totalVolumeRewards,
        this.maker.totalOIRewards,
        this.vault.totalOIRewards,
      ])
    },
    blobUrl: undefined,
    sybils: [] as Address[],
  },
} as const

export const CurrentSTIPSeason = (() => {
  if (typeof window !== 'undefined' && window.location) {
    const urlParams = new URLSearchParams(window.location.search)
    const seasonFromParam = urlParams.get('season')
    if (seasonFromParam && Number(seasonFromParam)) return Number(seasonFromParam) as STIPSeasonNumber
  }
  return Number(
    Object.entries(STIPDropParams)
      .find(([, v]) => !v.over)
      ?.at(0) ?? 3,
  ) as STIPSeasonNumber
})()

export const FinishedSTIPSeasons = Object.entries(STIPDropParams)
  .filter(([, v]) => v.over)
  .map(([k]) => Number(k) as STIPSeasonNumber)
export const AllSTIPSeasons = Object.keys(STIPDropParams).map((k) => Number(k) as STIPSeasonNumber)
