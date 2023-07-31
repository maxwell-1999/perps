import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Flex, Link, Text, useColorModeValue } from '@chakra-ui/react'
import { useMemo } from 'react'
import { Label, LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { parseAbi, zeroAddress } from 'viem'
import { useContractRead } from 'wagmi'
import { arbitrum } from 'wagmi/chains'

import { DataRow } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import { FormattedBig18Percent, FormattedBig18USDPrice, LoadingScreen } from '@/components/shared/components'
import { AssetMetadata } from '@/constants/assets'
import { ControllerAddresses } from '@/constants/contracts'
import { ExplorerURLs } from '@/constants/network'
import { useMarketContext } from '@/contexts/marketContext'
import { useProtocolSnapshot } from '@/hooks/markets'
import { useChainId } from '@/hooks/network'
import { shortenAddress } from '@/utils/addressUtils'
import { Big18Math, formatBig18Percent } from '@/utils/big18Utils'
import { utilization } from '@/utils/positionUtils'

import { useChartCopy } from './hooks'
import { DashedLine, MarketInfoContent } from './styles'

function MarketInfo() {
  const copy = useChartCopy()
  const chainId = useChainId()
  const { selectedMarket, selectedMarketSnapshot, makerAsset, selectedMakerMarketSnapshot, isMaker, snapshots } =
    useMarketContext()
  const { data: protocoSnapshot } = useProtocolSnapshot()

  const marketSnapshot = isMaker
    ? selectedMakerMarketSnapshot
    : selectedMarketSnapshot?.Long ?? selectedMarketSnapshot?.Short

  const { data: marketOwner } = useContractRead({
    chainId,
    enabled: !!marketSnapshot,
    abi: parseAbi(['function owner(address) view returns (address)'] as const),
    functionName: 'owner',
    address: ControllerAddresses[chainId],
    args: [marketSnapshot?.productAddress || zeroAddress],
  })

  const utilizationCurve = marketSnapshot?.productInfo.utilizationCurve

  const chartData = useMemo(() => {
    if (!utilizationCurve) return []
    return [
      { x: 0, y: Big18Math.toUnsafeFloat(utilizationCurve.minRate) },
      {
        x: Big18Math.toUnsafeFloat(utilizationCurve.targetUtilization),
        y: Big18Math.toUnsafeFloat(utilizationCurve.targetRate),
      },
      { x: 1, y: Big18Math.toUnsafeFloat(utilizationCurve.maxRate) },
    ]
  }, [utilizationCurve])

  const snapshot = isMaker ? snapshots?.[makerAsset] : selectedMarketSnapshot
  const longUtilization = snapshot?.Long && utilization(snapshot.Long.pre, snapshot.Long.position)
  const shortUtilization = snapshot?.Short && utilization(snapshot.Short.pre, snapshot.Short.position)

  const borderColor = useColorModeValue(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])
  const chartBg = useColorModeValue(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])

  if (!marketSnapshot || !protocoSnapshot || !utilizationCurve) return <LoadingScreen />

  return (
    <Flex flex={1} height="100%" alignItems="center" justifyContent="center">
      <MarketInfoContent>
        <Flex flexDirection="column" flex={1} py={4} minWidth="230px">
          <DataRow
            label={copy.market}
            value={AssetMetadata[isMaker ? makerAsset : selectedMarket].symbol}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.coordinator}
            value={
              <Link href={`${ExplorerURLs[chainId]}/address/${marketOwner}`} isExternal>
                <Text as="span" size="14px">
                  {shortenAddress(marketOwner || '')}
                </Text>
                <ExternalLinkIcon ml={1} mt={-1} color={colors.brand.purple[240]} />
              </Link>
            }
            size="lg"
            bordered
          />
          <DataRow
            label={copy.priceFeed}
            value={
              <Link href={`${ExplorerURLs[chainId]}/address/${marketSnapshot.productInfo.oracle}`} isExternal>
                <Text as="span" size="14px">
                  {shortenAddress(marketSnapshot.productInfo.oracle)}
                </Text>
                <ExternalLinkIcon ml={1} mt={-1} color={colors.brand.purple[240]} />
              </Link>
            }
            size="lg"
            bordered
          />
          <DataRow
            label={copy.collateral}
            value={chainId === arbitrum.id ? 'DSU / USDC.e' : 'DSU / USDC'}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.minCollateral}
            value={<FormattedBig18USDPrice value={protocoSnapshot.minCollateral} />}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.takerFees}
            value={<FormattedBig18Percent value={marketSnapshot.productInfo.takerFee} />}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.makerFees}
            value={<FormattedBig18Percent value={marketSnapshot.productInfo.makerFee} />}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.liquidationFee}
            value={<FormattedBig18Percent value={protocoSnapshot.liquidationFee} />}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.liquidationLeverage}
            value={`${(1 / Big18Math.toUnsafeFloat(marketSnapshot.productInfo.maintenance)).toString()}x`}
            size="lg"
          />
        </Flex>
        <Flex
          flexDirection="column"
          flex={1}
          gap={4}
          p={2}
          paddingRight={3}
          border={`1px solid ${borderColor}`}
          borderRadius="6px"
          bg={chartBg}
        >
          <Flex justifyContent="space-between">
            <Text px={4} variant="label">
              {copy.utilizationCurve}
            </Text>
            <Flex direction="row" gap={2}>
              <Text variant="label">{copy.current}</Text>
              <Flex gap={2}>
                <DashedLine color={colors.brand.green} />
                <Text variant="label" color={colors.brand.green}>
                  {copy.longUtilization}
                </Text>
              </Flex>
              <Flex gap={2}>
                <DashedLine color={colors.brand.red} />
                <Text variant="label" color={colors.brand.red}>
                  {copy.shortUtilization}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <ResponsiveContainer width="99%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="x"
                tickFormatter={(x) => (x === 0 ? '' : `${x * 100}%`)}
                tick={{ fill: colors.brand.gray[100] }}
                ticks={chartData.map(({ x }) => x)}
                type="number"
              >
                <Label offset={24} position="insideLeft" style={{ fill: colors.brand.gray[100], fontWeight: 600 }}>
                  {copy.utilization}
                </Label>
              </XAxis>
              <YAxis tickFormatter={(y) => `${y * 100}%`} tick={{ fill: colors.brand.gray[100] }}>
                <Label
                  offset={-6}
                  position="left"
                  angle={-90}
                  style={{ fill: colors.brand.gray[100], fontWeight: 600 }}
                >
                  {copy.funding}
                </Label>
              </YAxis>
              {longUtilization && (
                <ReferenceLine
                  x={Big18Math.toUnsafeFloat(longUtilization)}
                  stroke={colors.brand.green}
                  strokeDasharray="5 5"
                  isFront
                />
              )}
              {shortUtilization && (
                <ReferenceLine
                  x={Big18Math.toUnsafeFloat(shortUtilization)}
                  stroke={colors.brand.red}
                  strokeDasharray="5 5"
                  isFront
                />
              )}
              <Line
                type="linear"
                isAnimationActive={false}
                dataKey="y"
                stroke={colors.brand.purple[240]}
                strokeWidth={3}
                dot={{ r: 6, strokeWidth: 4, stroke: colors.brand.gray[360] }}
              >
                <LabelList
                  dataKey="x"
                  formatter={(value: number) =>
                    value === Big18Math.toUnsafeFloat(utilizationCurve.targetUtilization)
                      ? `${formatBig18Percent(utilizationCurve.targetRate)}`
                      : ''
                  }
                  position="insideBottomRight"
                  style={{ fill: colors.brand.gray[100] }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </Flex>
      </MarketInfoContent>
    </Flex>
  )
}

export default MarketInfo
