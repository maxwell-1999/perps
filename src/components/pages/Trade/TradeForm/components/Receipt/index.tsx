import { Flex, FlexProps, Text, useColorModeValue } from '@chakra-ui/react'

import InfoIcon from '@/SVG/Elements/Elements/InfoIcon'
import { DataRow } from '@/components/design-system'
import { TooltipDataRow } from '@/components/design-system/DataRow/DataRow'
import { TooltipIcon, TooltipText } from '@/components/design-system/Tooltip'
import colors from '@/components/design-system/theme/colors'
import { PositionSide2 } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { MarketSnapshot, UserMarketSnapshot, useMarket7dData } from '@/hooks/markets2'
import { useChainId } from '@/hooks/network'
import { Big6Math, formatBig6, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import {
  calcInterfaceFee,
  calcLeverage,
  calcLiquidationPrice,
  calcLpUtilization,
  calcMakerStats2,
  calcTradeFee,
} from '@/utils/positionUtils'

import { getMakerExposure } from '../../../PositionManager/utils'
import { useReceiptCopy } from '../../hooks'
import { EstimatedEntryRows } from './components'

interface ReceiptProps {
  product: MarketSnapshot
  positionDetails?: UserMarketSnapshot
  positionDelta: {
    collateralDelta: bigint
    positionDelta: bigint
    fullClose?: boolean
  }
  showCollateral?: boolean
  showLeverage?: boolean
  leverage?: number
  isLimit?: boolean
  limitPrice?: string
}

export function TradeReceipt({
  product,
  positionDelta,
  positionDetails,
  showCollateral,
  showLeverage,
  leverage,
  isLimit,
  limitPrice,
  ...props
}: ReceiptProps & FlexProps) {
  const copy = useReceiptCopy()
  const chainId = useChainId()
  const { data: market7dData } = useMarket7dData(product.asset)
  const { isMaker, orderDirection, selectedMarketSnapshot2 } = useMarketContext()
  const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])

  const {
    parameter: { settlementFee },
    global: { latestPrice },
  } = product

  const price = isLimit && limitPrice ? Big6Math.fromFloatString(limitPrice) : latestPrice

  const tradingFee = calcTradeFee({
    positionDelta: positionDelta.positionDelta,
    isMaker,
    marketSnapshot: selectedMarketSnapshot2,
    direction: orderDirection,
  })

  const newPosition = positionDelta.positionDelta + (positionDetails?.nextMagnitude ?? 0n)
  const newCollateral = positionDelta.fullClose
    ? 0n
    : positionDelta.collateralDelta + (positionDetails?.local.collateral ?? 0n)
  const newLeverage = calcLeverage(price, newPosition, newCollateral)

  const lpUtilization = calcLpUtilization(selectedMarketSnapshot2)

  const makerExposure = getMakerExposure(lpUtilization?.lpUtilization, newLeverage)

  const makerStats = calcMakerStats2({
    funding: market7dData?.makerAccumulation.funding ?? 0n,
    interest: market7dData?.makerAccumulation.interest ?? 0n,
    positionFee: market7dData?.makerAccumulation.positionFee ?? 0n,
    positionSize: newPosition,
    collateral: newCollateral,
  })

  const liquidationPrices = calcLiquidationPrice({
    marketSnapshot: product,
    collateral: newCollateral,
    position: newPosition,
    limitPrice: isLimit ? price : undefined,
  })

  const hideLiquidationPrice = (leverage && leverage < 1) || !newPosition
  const hasPositionChange = positionDelta.positionDelta !== 0n

  const interfaceFee = calcInterfaceFee({
    positionStatus: positionDetails?.status,
    latestPrice: product.global.latestPrice,
    chainId,
    positionDelta: positionDelta.positionDelta,
    side: isMaker ? PositionSide2.maker : orderDirection,
  })

  const nonImpactTradeFee = isMaker ? 0n : Big6Math.mul(product.parameter.positionFee, tradingFee.total)

  return (
    <Flex flexDirection="column" {...props}>
      {isMaker && (
        <>
          <DataRow
            label={
              <Flex alignItems="center" gap={2}>
                <Text variant="label">{copy.totalAPR}</Text>
                <TooltipIcon
                  height="11px"
                  width="11px"
                  color={alpha50}
                  tooltipText={<Text fontSize="11px">{copy.totalAprCalculation}</Text>}
                />
              </Flex>
            }
            value={
              <TooltipText
                tooltipText={
                  <Flex flexDirection="column" alignItems="center" pt={2}>
                    <TooltipDataRow
                      label={copy.fundingFees}
                      value={formatBig6Percent(makerStats.fundingAPR + makerStats.interestAPR, {
                        numDecimals: 4,
                      })}
                    />
                    <TooltipDataRow
                      label={copy.tradingFees}
                      value={formatBig6Percent(makerStats.positionFeeAPR, {
                        numDecimals: 4,
                      })}
                    />
                  </Flex>
                }
              >
                <Text fontSize="13px">
                  {formatBig6Percent(makerStats.fundingAPR + makerStats.interestAPR + makerStats.positionFeeAPR, {
                    numDecimals: 4,
                  })}
                </Text>
              </TooltipText>
            }
          />
          <DataRow
            label={copy.exposure}
            value={`${formatBig6Percent(makerExposure ?? 0n)} ${lpUtilization?.exposureSide}`}
          />
        </>
      )}
      {!isMaker && isLimit && (
        <DataRow label={copy.estEntry} value={formatBig6USDPrice(Big6Math.fromFloatString(limitPrice ?? '0'))} />
      )}
      {!isMaker && !isLimit && (
        <EstimatedEntryRows
          positionDelta={positionDelta.positionDelta}
          totalTradingFee={tradingFee.total}
          marketSnapshot={product}
        />
      )}
      {showCollateral && <DataRow label={copy.collateral} value={formatBig6USDPrice(newCollateral)} />}
      {!isMaker && (
        <DataRow
          label={copy.liquidationPrice}
          value={
            hideLiquidationPrice
              ? copy.noValue
              : formatBig6USDPrice(
                  orderDirection === PositionSide2.long ? liquidationPrices.long : liquidationPrices.short,
                )
          }
        />
      )}
      {showLeverage && <DataRow label={copy.leverage} value={`${formatBig6(newLeverage)}x`} />}
      {isMaker && (
        <>
          <DataRow
            label={copy.makerLiqPrice}
            value={
              hideLiquidationPrice
                ? copy.noValue
                : `${formatBig6USDPrice(liquidationPrices.long)}/${formatBig6USDPrice(liquidationPrices.short)}`
            }
          />
        </>
      )}

      {isMaker && (
        <DataRow
          label={copy.tradingFee}
          value={
            <TooltipText
              fontSize="13px"
              tooltipText={
                <Flex flexDirection="column" alignItems="center" pt={2}>
                  <TooltipDataRow
                    label={copy.settlementFee}
                    value={formatBig6USDPrice(settlementFee, { compact: true })}
                  />
                  <TooltipDataRow
                    label={copy.feeBasisPoints}
                    value={formatBig6Percent(tradingFee.feeBasisPoints, { numDecimals: 4 })}
                  />
                  {interfaceFee.interfaceFeeBps > 0n && (
                    <TooltipDataRow
                      label={copy.interfaceFee}
                      value={formatBig6Percent(interfaceFee.interfaceFeeBps, { numDecimals: 4 })}
                    />
                  )}
                </Flex>
              }
            >
              {formatBig6USDPrice(
                hasPositionChange ? tradingFee.total + interfaceFee.interfaceFee + settlementFee : 0n,
              )}
            </TooltipText>
          }
        />
      )}
      {!isMaker && !isLimit && (
        <DataRow
          label={copy.tradingFee}
          value={
            <TooltipText
              fontSize="13px"
              textDecorationColor={'transparent'}
              tooltipText={
                <Flex flexDirection="column" alignItems="center" pt={2} width="100%">
                  <TooltipDataRow
                    label={copy.settlementFee}
                    value={formatBig6USDPrice(settlementFee, { compact: true })}
                  />
                  <TooltipDataRow
                    label={copy.feeBasisPoints}
                    value={formatBig6Percent(Big6Math.mul(product.parameter.positionFee, tradingFee.feeBasisPoints), {
                      numDecimals: 4,
                    })}
                  />
                  <TooltipDataRow
                    label={copy.interfaceFee}
                    value={formatBig6Percent(interfaceFee.interfaceFeeBps, { numDecimals: 4 })}
                  />
                </Flex>
              }
            >
              <div className="flex items-center gap-1 ">
                {formatBig6USDPrice(
                  hasPositionChange ? interfaceFee.interfaceFee + settlementFee + nonImpactTradeFee : 0n,
                )}
                <svg width={13} height={13} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
                  <circle cx={6.901} cy={6.36} r={6} fill="#808191" />
                  <path
                    d="M6.352 9.595V4.968h1.09v4.627h-1.09ZM6.9 4.311a.636.636 0 0 1-.446-.172.554.554 0 0 1-.186-.418c0-.165.062-.305.186-.42a.63.63 0 0 1 .446-.174c.175 0 .324.058.446.175a.547.547 0 0 1 .187.419.554.554 0 0 1-.187.418.63.63 0 0 1-.446.172Z"
                    fill="black"
                  />
                </svg>
              </div>
            </TooltipText>
          }
        />
      )}
    </Flex>
  )
}
