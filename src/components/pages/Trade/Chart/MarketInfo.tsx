import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Flex, Link, Text } from '@chakra-ui/react'
import { arbitrum } from 'wagmi/chains'

import { DataRow } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import { FormattedBig6Percent, FormattedBig6USDPrice, LoadingScreen } from '@/components/shared/components'
import { AssetMetadata } from '@/constants/markets'
import { ExplorerURLs } from '@/constants/network'
import { useMarketContext } from '@/contexts/marketContext'
import { useChainId } from '@/hooks/network'
import { shortenAddress } from '@/utils/addressUtils'
import { formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'

import { useChartCopy } from './hooks'
import { MarketInfoContent, PercentRange } from './styles'

function MarketInfo() {
  const copy = useChartCopy()
  const chainId = useChainId()
  const {
    selectedMarket,

    selectedMakerMarket,
    selectedMarketSnapshot2,
    isMaker,
  } = useMarketContext()

  if (!selectedMarketSnapshot2) return <LoadingScreen />

  const {
    market,
    oracle,
    riskParameter: {
      takerFee,
      makerFee,
      makerImpactFee,
      liquidationFee,
      margin,
      minMargin,
      maintenance,
      minMaintenance,
      maxLiquidationFee,
      takerSkewFee,
      takerImpactFee,
      minLiquidationFee,
      efficiencyLimit,
    },
    parameter: { fundingFee, interestFee, settlementFee },
    global: { latestPrice },
  } = selectedMarketSnapshot2

  const takerFeeMax = takerFee + takerSkewFee + takerImpactFee
  const makerFeeMax = makerFee + makerImpactFee

  return (
    <Flex flex={1} height="100%" alignItems="center" justifyContent="center">
      <MarketInfoContent>
        <Flex
          flexDirection="column"
          flex={1}
          py={{ base: 0, tableBreak: 4 }}
          pt={{ base: 4, tableBreak: 4 }}
          minWidth="230px"
        >
          <DataRow
            label={copy.market}
            value={AssetMetadata[isMaker ? selectedMakerMarket : selectedMarket].symbol}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.address}
            value={
              <Link href={`${ExplorerURLs[chainId]}/address/${market}`} isExternal>
                <Text as="span" size="14px">
                  {shortenAddress(market || '')}
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
              <Link href={`${ExplorerURLs[chainId]}/address/${oracle}`} isExternal>
                <Text as="span" size="14px">
                  {shortenAddress(oracle)}
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
            label={copy.margin}
            value={`${formatBig6Percent(margin)} (${formatBig6USDPrice(minMargin)})`}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.maintenance}
            value={`${formatBig6Percent(maintenance)} (${formatBig6USDPrice(minMaintenance)})`}
            size="lg"
            bordered
          />
          <DataRow label={copy.takerFees} value={<PercentRange max={takerFeeMax} />} size="lg" bordered />
          <DataRow label={copy.makerFees} value={<PercentRange max={makerFeeMax} />} size="lg" bordered />
        </Flex>
        <Flex flexDirection="column" flex={1} py={{ base: 0, tableBreak: 4 }} pt={{ base: 0 }} minWidth="230px">
          <DataRow label={copy.latestPrice} value={<FormattedBig6USDPrice value={latestPrice} />} size="lg" bordered />
          <DataRow
            label={copy.liquidationFee}
            value={<FormattedBig6Percent value={liquidationFee} />}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.minLiquidationFee}
            value={<FormattedBig6USDPrice compact value={minLiquidationFee} />}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.maxLiquidationFee}
            value={<FormattedBig6USDPrice compact value={maxLiquidationFee} />}
            size="lg"
            bordered
          />
          <DataRow label={copy.fundingFee} value={<FormattedBig6Percent value={fundingFee} />} size="lg" bordered />
          <DataRow label={copy.interestFee} value={<FormattedBig6Percent value={interestFee} />} size="lg" bordered />
          <DataRow
            label={copy.settlementFee}
            value={<FormattedBig6USDPrice compact value={settlementFee} />}
            size="lg"
            bordered
          />
          <DataRow
            label={copy.efficiencyLimit}
            value={<FormattedBig6Percent value={efficiencyLimit} />}
            size="lg"
            bordered
          />
        </Flex>
      </MarketInfoContent>
    </Flex>
  )
}

export default MarketInfo
