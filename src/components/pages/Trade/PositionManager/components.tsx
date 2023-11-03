import { RepeatIcon } from '@chakra-ui/icons'
import { Box, Flex, Link, Text } from '@chakra-ui/react'
import Image from 'next/image'
import React, { ReactNode } from 'react'

import { IconButton } from '@/components/design-system'
import { DataRow, TooltipDataRow } from '@/components/design-system/DataRow/DataRow'
import { TooltipIcon, TooltipText } from '@/components/design-system/Tooltip'
import { AssetMetadata, PositionSide2, PositionStatus, SupportedAsset } from '@/constants/markets'
import { ExplorerURLs } from '@/constants/network'
import { SubPositionChange, UserMarketSnapshot } from '@/hooks/markets2'
import { useChainId } from '@/hooks/network'
import { RealizedAccumulations } from '@/utils/accumulatorUtils'
import { sum } from '@/utils/arrayUtils'
import { Big6Math, BigOrZero, formatBig6, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import { formatDateRelative } from '@/utils/timeUtils'

import colors from '@ds/theme/colors'

import { calcNotional, getStatusDetails } from '@utils/positionUtils'

import { StatusLight } from './CurrentPosition/components'
import { usePositionManagerCopy, useStyles } from './hooks'

export const AssetDirectionLabel = ({
  market,
  direction,
  hideIcon,
}: {
  market: AssetMetadata[SupportedAsset]
  direction: PositionSide2 | React.ReactNode
  hideIcon?: boolean
}) => {
  const directionColor = direction === PositionSide2.long ? colors.brand.green : colors.brand.red
  return (
    <Flex alignItems="center">
      {!hideIcon && (
        <Box mr={3}>
          <Image src={market.icon} height={25} width={25} alt={market.name} />
        </Box>
      )}
      <Flex flexDirection="column">
        <Text fontSize="15px">{market.symbol}</Text>
        <Text fontSize="13px" color={directionColor} textTransform="capitalize">
          {direction}
        </Text>
      </Flex>
    </Flex>
  )
}

export const Status = ({
  userMarketSnapshot,
  liquidated,
  isMaker,
}: {
  userMarketSnapshot: UserMarketSnapshot
  liquidated: boolean
  isMaker: boolean
}) => {
  const { statusColor, isOpenPosition, status } = getStatusDetails({ userMarketSnapshot, liquidated, isMaker })
  const copy = usePositionManagerCopy()
  const statusLabel = liquidated ? copy.liquidated : copy[status]
  const isSyncError = status === PositionStatus.syncError && !liquidated

  return (
    <StatusCell
      statusColor={statusColor}
      glow={isOpenPosition || status === PositionStatus.failed}
      statusLabel={
        isSyncError ? (
          <Flex alignItems="center" gap={2} ml={2}>
            <Text fontSize="13px">{statusLabel}</Text>
            <TooltipIcon tooltipText={copy.syncErrorMessage} />
          </Flex>
        ) : (
          statusLabel
        )
      }
    />
  )
}

export const StatusCell = ({
  statusColor,
  glow,
  statusLabel,
}: {
  statusColor: string
  glow: boolean
  statusLabel: string | React.ReactNode
}) => {
  return (
    <Flex alignItems="center">
      <StatusLight color={statusColor} glow={glow} />
      {typeof statusLabel === 'string' ? (
        <Text fontSize="14px" ml={3}>
          {statusLabel}
        </Text>
      ) : (
        statusLabel
      )}
    </Flex>
  )
}

export const TableEmptyScreen = ({ message }: { message: string }) => {
  return (
    <Flex
      alignItems="center"
      className="!bg-[#171722]"
      justifyContent="center"
      flexDirection="column"
      py={10}
      height="100%"
    >
      <Text mt={2} fontSize="15px" variant="label">
        {message}
      </Text>
    </Flex>
  )
}

export const RetryButton = ({ onClick }: { onClick: () => void }) => {
  const copy = usePositionManagerCopy()
  return (
    <IconButton
      bg="none"
      border="none"
      _hover={{
        bg: colors.brand.whiteAlpha[10],
      }}
      icon={<RepeatIcon />}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={copy.retry}
      alt-text={copy.retry}
    />
  )
}

export const RealizedAccumulationsTooltip = ({
  children,
  values,
  fees,
  side,
  unrealized,
}: {
  children: ReactNode
  values: RealizedAccumulations
  fees: bigint
  side: PositionSide2
  unrealized?: bigint
}) => {
  const copy = usePositionManagerCopy()

  const tooltipValues =
    side === 'maker'
      ? {
          [copy.profitLoss]: formatBig6USDPrice(values.pnl),
          [copy.funding]: formatBig6USDPrice(values.funding + values.interest),
          [copy.tradingFees]: formatBig6USDPrice(values.makerPositionFee),
          [copy.marketFees]: `-${formatBig6USDPrice(fees)}`,
        }
      : {
          [copy.profitLoss]: formatBig6USDPrice(values.pnl),
          [copy.funding]: formatBig6USDPrice(values.funding + values.interest),
          [copy.marketFees]: `-${formatBig6USDPrice(fees)}`,
        }

  return (
    <TooltipText
      tooltipProps={{
        placement: 'top-start',
      }}
      textDecorationThickness="0.05em"
      tooltipText={
        <Flex flexDirection="column" alignItems="center" pt={2}>
          {unrealized ? (
            <TooltipDataRow
              label={
                <Text color={colors.brand.whiteAlpha[70]} textDecoration="underline" as="span">
                  {copy.realized}
                </Text>
              }
              value=""
            />
          ) : undefined}
          {Object.entries(tooltipValues).map(([key, value]) => (
            <TooltipDataRow key={key} label={key as string} value={value} />
          ))}
          {unrealized ? (
            <>
              <TooltipDataRow
                label={
                  <Text color={colors.brand.whiteAlpha[70]} textDecoration="underline" as="span">
                    {copy.unrealized}
                  </Text>
                }
                value=""
                mb={1}
              />
              <TooltipDataRow label={copy.totalPNL} value={formatBig6USDPrice(unrealized)} />
            </>
          ) : undefined}
        </Flex>
      }
    >
      {children}
    </TooltipText>
  )
}

export const SubPositionRow = ({
  asset,
  change,
  liquidation,
  liquidationFee,
  side,
  changeIndex,
}: {
  asset: SupportedAsset
  change: SubPositionChange
  liquidation: boolean
  liquidationFee: bigint
  side: PositionSide2
  changeIndex: number
}) => {
  const copy = usePositionManagerCopy()
  const { subheaderTextColor, red, green } = useStyles()
  const chainId = useChainId()
  const {
    accumulations,
    magnitude,
    delta,
    valid: valid_,
    interfaceFee,
    orderFee,
    collateral: collateralChange_,
    realizedValues,
    collateralOnly,
  } = change
  const settled = accumulations.length > 0 || collateralOnly
  const price = BigInt(change.priceWithImpact)
  const value = accumulations.reduce((acc, cur) => acc + BigInt(cur.accumulatedValue), 0n)
  const fees =
    accumulations.reduce(
      (acc, cur) => acc + BigInt(cur.accumulationResult_keeper) + BigInt(cur.accumulationResult_positionFee),
      0n,
    ) +
    (liquidation ? liquidationFee : 0n) +
    BigInt(interfaceFee) +
    BigInt(orderFee)

  const priceImpactFee = sum(accumulations.map((a) => BigInt(a.priceImpactFee)))
  const displayFees = side === 'maker' ? fees : fees - priceImpactFee
  const pnl = value - fees
  const collateralChange = BigInt(collateralChange_) + BigInt(interfaceFee) + BigInt(orderFee) + BigInt(liquidationFee)
  const collateral =
    BigOrZero(accumulations.at(-1)?.collateral) + BigInt(interfaceFee) + BigInt(orderFee) + BigInt(liquidationFee)
  const valid = valid_ || ((delta ?? 0n) === 0n && collateralChange !== 0n)

  return (
    <Flex paddingTop={2} paddingBottom={2} alignItems="center" justifyContent="center">
      <Box flex="1">
        <Link
          href={`${ExplorerURLs[chainId]}/tx/${change.transactionHash}`}
          isExternal
          textAlign="left"
          fontSize="13px"
          color={subheaderTextColor}
        >
          {formatDateRelative(new Date(Number(change.blockTimestamp) * 1000))}
        </Link>
      </Box>
      <Box flex="1">
        <Flex flexDirection="column">
          <Text fontSize="13px">
            {formatBig6(magnitude)} {asset.toUpperCase()}
          </Text>
          <Text variant="label" fontSize="11px">
            {formatBig6USDPrice(calcNotional(magnitude, price))}
          </Text>
        </Flex>
      </Box>
      <Flex flex="1" alignItems="center" gap={1}>
        {delta !== null ? (
          <Text fontSize="13px">
            {delta >= 0n ? (
              // eslint-disable-next-line formatjs/no-literal-string-in-jsx
              <Text as="span" color={green} verticalAlign="text-bottom">
                +
              </Text>
            ) : (
              // eslint-disable-next-line formatjs/no-literal-string-in-jsx
              <Text as="span" color={red} verticalAlign="text-bottom">
                –
              </Text>
            )}
            <Text as="span" marginLeft={1}>
              {formatBig6(Big6Math.abs(delta))} {asset.toUpperCase()}
            </Text>
          </Text>
        ) : (
          <Text fontSize="13px">{copy.noValue}</Text>
        )}
        {liquidation && <TooltipIcon tooltipText={copy.liquidated} color={colors.brand.red} />}
      </Flex>
      <Box flex="1">
        <Flex flexDirection="column">
          <Text fontSize="13px">{settled ? formatBig6USDPrice(collateral) : copy.noValue}</Text>
          {collateralChange !== 0n && (
            <Text variant="label" fontSize="11px">
              {collateralChange >= 0n ? (
                // eslint-disable-next-line formatjs/no-literal-string-in-jsx
                <Text as="span" color={green} verticalAlign="text-bottom">
                  +
                </Text>
              ) : (
                // eslint-disable-next-line formatjs/no-literal-string-in-jsx
                <Text as="span" color={red} verticalAlign="text-bottom">
                  –
                </Text>
              )}
              <Text as="span" marginLeft={1}>
                {formatBig6USDPrice(Big6Math.abs(collateralChange))}
              </Text>
            </Text>
          )}
        </Flex>
      </Box>
      <Box flex="1">
        {settled && valid ? (
          <Text fontSize="13px">{formatBig6USDPrice(price)}</Text>
        ) : !valid && changeIndex > 0 ? (
          <TooltipText
            tooltipText={copy.failedTooltip}
            tooltipProps={{ placement: 'top' }}
            fontSize="13px"
            textDecorationColor={colors.brand.red}
          >
            {copy.failed}
          </TooltipText>
        ) : (
          <Text fontSize="13px">{copy.noValue}</Text>
        )}
      </Box>
      <Box flex="1">
        {!!liquidation ? (
          <TooltipText
            tooltipText={copy.liquidationFeeTooltip(liquidationFee)}
            tooltipProps={{ placement: 'top-start' }}
            fontSize="13px"
          >
            {formatBig6USDPrice(displayFees)}
          </TooltipText>
        ) : (
          <Text fontSize="13px">{settled ? formatBig6USDPrice(displayFees) : copy.noValue}</Text>
        )}
      </Box>
      <Box flex="1">
        <Flex flexDirection="column">
          {settled ? (
            <>
              <RealizedAccumulationsTooltip values={realizedValues} fees={displayFees} side={side}>
                <Text fontSize="13px" color={pnl >= 0n ? (pnl === 0n ? undefined : green) : red}>
                  {formatBig6USDPrice(pnl)}
                </Text>
              </RealizedAccumulationsTooltip>
              <Text variant="label" fontSize="11px">
                {collateral ? formatBig6Percent(Big6Math.div(pnl, collateral)) : copy.noValue}
              </Text>
            </>
          ) : (
            <Text fontSize="13px">
              {copy.unsettled}
              <TooltipIcon
                ml={1}
                tooltipText={copy.unsettledTooltip}
                tooltipProps={{ placement: 'top-start' }}
                fontSize="13px"
              />
            </Text>
          )}
        </Flex>
      </Box>
    </Flex>
  )
}

export const MobileDataRow = ({ label, value }: { label: string; value: React.ReactNode }) => {
  const rowBorder = `1px solid ${colors.brand.whiteAlpha[10]}`
  return <DataRow label={label} borderBottom={rowBorder} value={value} />
}
