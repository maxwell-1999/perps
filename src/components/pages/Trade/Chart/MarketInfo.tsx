import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Box, Flex, Link, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { useMemo } from 'react'
import { Label, LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { parseAbi, zeroAddress } from 'viem'
import { useContractRead } from 'wagmi'

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

function MarketInfo() {
  const copy = useChartCopy()
  const chainId = useChainId()
  const { selectedMarket, selectedMarketSnapshot } = useMarketContext()
  const { data: protocoSnapshot } = useProtocolSnapshot()

  const marketSnapshot = selectedMarketSnapshot?.Long ?? selectedMarketSnapshot?.Short
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
  const longUtilization =
    selectedMarketSnapshot?.Long && utilization(selectedMarketSnapshot.Long.pre, selectedMarketSnapshot.Long.position)
  const shortUtilization =
    selectedMarketSnapshot?.Short &&
    utilization(selectedMarketSnapshot.Short.pre, selectedMarketSnapshot.Short.position)

  if (!marketSnapshot || !protocoSnapshot || !utilizationCurve) return <LoadingScreen />

  return (
    <Flex gap={4} p={4}>
      <Box flex={1}>
        <DataRow label={copy.market} value={AssetMetadata[selectedMarket].symbol} size="lg" />
        <DataRow
          label={copy.coordinator}
          value={
            <Box>
              <Link href={`${ExplorerURLs[chainId]}/address/${marketOwner}`} isExternal>
                <Text as="span" size="14px">
                  {shortenAddress(marketOwner || '')}
                </Text>
                <ExternalLinkIcon ml={1} mt={-1} color={colors.brand.purple[240]} />
              </Link>
            </Box>
          }
          size="lg"
        />
        <DataRow
          label={copy.priceFeed}
          value={
            <Box>
              <Link href={`${ExplorerURLs[chainId]}/address/${marketSnapshot.productInfo.oracle}`} isExternal>
                <Text as="span" size="14px">
                  {shortenAddress(marketSnapshot.productInfo.oracle)}
                </Text>
                <ExternalLinkIcon ml={1} mt={-1} color={colors.brand.purple[240]} />
              </Link>
            </Box>
          }
          size="lg"
        />
        <DataRow label={copy.collateral} value={'DSU / USDC'} size="lg" />
        <DataRow
          label={copy.minCollateral}
          value={<FormattedBig18USDPrice value={protocoSnapshot.minCollateral} />}
          size="lg"
        />
        <DataRow
          label={copy.takerFees}
          value={<FormattedBig18Percent value={marketSnapshot.productInfo.takerFee} />}
          size="lg"
        />
        <DataRow
          label={copy.makerFees}
          value={<FormattedBig18Percent value={marketSnapshot.productInfo.makerFee} />}
          size="lg"
        />
        <DataRow
          label={copy.liquidationFee}
          value={<FormattedBig18Percent value={protocoSnapshot.liquidationFee} />}
          size="lg"
        />
        <DataRow
          label={copy.liquidationLeverage}
          value={`${(1 / Big18Math.toUnsafeFloat(marketSnapshot.productInfo.maintenance)).toString()}x`}
          size="lg"
        />
      </Box>
      <Flex flex={1} direction="column" gap={4}>
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
        <ResponsiveContainer width="100%">
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
              <Label offset={-6} position="left" angle={-90} style={{ fill: colors.brand.gray[100], fontWeight: 600 }}>
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
              dot={{ r: 6, strokeWidth: 4, stroke: colors.brand.blackSolid[5] }}
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
    </Flex>
  )
}

const DashedLine = styled.span<{ color: string }>`
  height: 20px;
  width: 16px;
  background: ${({ color }) => `repeating-linear-gradient(90deg, ${color} 0 5px, #000000 0 7px) center`};
  background-size: 100% 1px;
  background-repeat: no-repeat;
`

export default MarketInfo
