import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Link,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'

import { Badge } from '@/components/design-system/Badge'
import { AssetIconWithText } from '@/components/shared/components'
import { AssetMetadata, PositionSide2, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { useActiveSubPositionHistory, useChainLivePrices2 } from '@/hooks/markets2'
import { notEmpty } from '@/utils/arrayUtils'
import { BigOrZero, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import { getOrderValuesFromPosition } from '@/utils/positionUtils'

import colors from '@ds/theme/colors'

import {
  AssetDirectionLabel,
  MobileDataRow,
  RealizedAccumulationsTooltip,
  RetryButton,
  Status,
  SubPositionRow,
  TableEmptyScreen,
} from '../components'
import { PositionTableData } from '../constants'
import { usePnl2, usePositionManagerCopy, useStyles } from '../hooks'

export const AllPositionsTable = ({
  positions,
  onClick,
  emptyStateMessage,
}: {
  positions: PositionTableData[]
  onClick?: (row: PositionTableData) => void
  emptyStateMessage: string
}) => {
  const { isMaker } = useMarketContext()
  const { background } = useStyles()
  const copy = usePositionManagerCopy()
  const isBase = useBreakpointValue({ base: true, tableBreak: false }, { ssr: false })

  return (
    <Box>
      {!isBase && (
        <Flex
          alignItems="center"
          justifyContent="center"
          py={1}
          px={4}
          position="sticky"
          top={0}
          background={background}
        >
          <Text variant="label" flex="3">
            {copy.market}
          </Text>
          <Text variant="label" flex="2">
            {copy.leverage}
          </Text>
          <Text variant="label" flex="2">
            {copy.size}
          </Text>
          <Text variant="label" flex="2">
            {copy.openLiq}
          </Text>
          <Text variant="label" flex="2">
            {copy.pnl}
          </Text>
          {isMaker && (
            <Text variant="label" flex="2">
              {copy.exposure}
            </Text>
          )}
          <Text variant="label" flex="2">
            {copy.status}
          </Text>
          {/* Box to take up the same space the Retry button does */}
          <Box flex="1" />
          {/* Box to take up the same space the accordion icon does */}
          <Box flexShrink="0" w="20px" h="20px" />
        </Flex>
      )}
      {Boolean(positions.length) ? (
        <Accordion allowMultiple>
          {positions.map((position, i) => (
            <CurrentPositionsTableRow key={i} row={position} onClick={onClick} isBase={isBase} />
          ))}
        </Accordion>
      ) : (
        <TableEmptyScreen message={emptyStateMessage} />
      )}
    </Box>
  )
}

const CurrentPositionsTableRow = ({
  row,
  onClick,
  isBase,
}: {
  row: PositionTableData
  onClick?: (row: PositionTableData) => void
  isBase?: boolean
}) => {
  const { isMaker, setOverrideValues, snapshots2 } = useMarketContext()
  const livePrices = useChainLivePrices2()
  const copy = usePositionManagerCopy()
  const { green, red, borderColor, alpha5, alpha50, alpha20 } = useStyles()
  const market = AssetMetadata[row.asset]
  const pnlData = usePnl2(row.details, snapshots2?.market[row.asset], livePrices, row.failedClose)
  const isPnlPositive = pnlData ? pnlData.livePnl >= 0n : true
  const pnlPercentage = formatBig6Percent(pnlData?.livePnlPercent ?? 0n)
  const pnl = formatBig6USDPrice(pnlData?.livePnl ?? 0n)
  const closingOrFailed = row.isClosing || row.failedClose || row.details.status === PositionStatus.syncError
  const direction = closingOrFailed ? row.details.side : row.details.nextSide
  const directionColor = direction === PositionSide2.long ? colors.brand.green : colors.brand.red

  const subPositionBg = useColorModeValue('white', 'black')
  const hoverColor = useColorModeValue(colors.brand.whiteAlpha[10], colors.brand.blackAlpha[10])

  const NoValueText = (
    <Text color={alpha50} as="span">
      {copy.noValue}
    </Text>
  )

  const pnlNode = pnlData ? (
    <RealizedAccumulationsTooltip
      side={row.details.side || PositionSide2.none}
      values={pnlData.data.accumulatedPnl}
      fees={pnlData.totalFees}
      unrealized={pnlData.liveUnrealized}
    >
      {pnl}
    </RealizedAccumulationsTooltip>
  ) : (
    pnl
  )

  if (isBase) {
    return (
      <AccordionItem>
        <AccordionButton height="50px">
          <Flex flexDirection="row" width="100%" justifyContent="space-between" alignItems="center">
            <Flex alignItems="center">
              <Link
                onClick={() => (onClick ? onClick(row) : undefined)}
                _hover={!onClick ? { textDecoration: 'none' } : undefined}
              >
                <AssetIconWithText market={AssetMetadata[row.asset]} size="sm" mr={2} />
              </Link>
            </Flex>
            <Flex flex="2">
              {row.details.status === PositionStatus.opening ? (
                NoValueText
              ) : (
                <Flex fontSize="14px" color={isPnlPositive ? green : red}>
                  {isPnlPositive && copy.plus}
                  {pnlNode}
                </Flex>
              )}
            </Flex>
            <Flex justifyContent="flex-end" pr={2}>
              <Status userMarketSnapshot={row.details} liquidated={!!pnlData?.liquidation} isMaker={isMaker} />
            </Flex>
            <AccordionIcon />
          </Flex>
        </AccordionButton>
        <AccordionPanel pb={4} borderTop={`1px solid ${alpha20}`} bg="black">
          <MobileDataRow label={copy.market} value={<Text fontSize="13px">{market.symbol}</Text>} />
          <MobileDataRow
            label={copy.direction}
            value={
              <Text fontSize="13px" color={directionColor} textTransform="capitalize">
                {row.isClosed ? NoValueText : closingOrFailed ? row.details.side : row.details.nextSide}
              </Text>
            }
          />
          <MobileDataRow
            label={copy.pnl}
            value={
              <Box fontSize="13px" color={isPnlPositive ? green : red}>
                {isPnlPositive && copy.plus}
                {pnlNode}
              </Box>
            }
          />
          <MobileDataRow
            label={copy.leverage}
            value={
              <Text fontSize="13px">
                {row.isClosed ? NoValueText : closingOrFailed ? row.leverage : row.nextLeverage}
                {copy.x}
              </Text>
            }
          />
          <MobileDataRow
            label={copy.size}
            value={
              <Flex flexDirection="column">
                <Text fontSize="13px">
                  {!closingOrFailed ? row.nextPosition : row.position} {row.asset.toUpperCase()}
                </Text>
              </Flex>
            }
          />
          <MobileDataRow
            label={copy.sizeNotional}
            value={
              <Flex flexDirection="column">
                <Text fontSize="13px">{!closingOrFailed ? row.nextNotional : row.notional}</Text>
              </Flex>
            }
          />
          <MobileDataRow label={copy.open} value={<Text fontSize="13px">{pnlData?.averageEntryPriceFormatted}</Text>} />
          <MobileDataRow label={copy.liquidation} value={<Text fontSize="13px">{row.liquidationPrice}</Text>} />
          {isMaker && (
            <MobileDataRow
              label={copy.exposure}
              value={<Text fontSize="13px">{row.makerExposure || copy.noValue}</Text>}
            />
          )}
        </AccordionPanel>
      </AccordionItem>
    )
  }

  return (
    <AccordionItem borderBottom="none" _hover={{ bg: hoverColor }}>
      <Box>
        <AccordionButton
          as="div"
          cursor="pointer"
          textAlign="left"
          _expanded={{ borderBottom: `1px solid ${borderColor}`, background: alpha5 }}
        >
          <Box flex="3" display="flex">
            <Link
              onClick={() => (onClick ? onClick(row) : undefined)}
              _hover={!onClick ? { textDecoration: 'none' } : undefined}
            >
              <AssetDirectionLabel
                market={market}
                direction={row.isClosed ? NoValueText : closingOrFailed ? row.details.side : row.details.nextSide}
              />
            </Link>
          </Box>
          <Box flex="2">
            {row.isClosed ? (
              NoValueText
            ) : (
              <Badge>
                <Text as="span" fontSize="13px">
                  {closingOrFailed ? row.leverage : row.nextLeverage}
                  {copy.x}
                </Text>
              </Badge>
            )}
          </Box>
          <Box flex="2">
            <Flex flexDirection="column">
              <Text fontSize="14px">
                {!closingOrFailed ? row.nextPosition : row.position} {row.asset.toUpperCase()}
              </Text>
              <Text variant="label" fontSize="12px">
                {!closingOrFailed ? row.nextNotional : row.notional}
              </Text>
            </Flex>
          </Box>
          <Box flex="2">
            <Flex flexDirection="column">
              <Text fontSize="14px">{pnlData?.averageEntryPriceFormatted}</Text>
              <Text variant="label" fontSize="12px">
                {row.liquidationPrice}
              </Text>
            </Flex>
          </Box>
          <Box flex="2">
            <Flex flexDirection="column">
              {row.details.status === PositionStatus.opening ? (
                <Text fontSize="14px">{copy.noValue}</Text>
              ) : (
                <>
                  <Box fontSize="14px" color={isPnlPositive ? green : red}>
                    {pnlNode}
                  </Box>
                  <Text variant="label" fontSize="12px">
                    {pnlPercentage}
                  </Text>
                </>
              )}
            </Flex>
          </Box>
          {isMaker && (
            <Box flex="2">
              <Text fontSize="14px">{row.makerExposure || copy.noValue}</Text>
              <Text fontSize="13px" color={colors.brand.whiteAlpha[50]}>
                {row.exposureSide}
              </Text>
            </Box>
          )}
          <Box flex="2">
            <Status userMarketSnapshot={row.details} liquidated={!!pnlData?.liquidation} isMaker={isMaker} />
          </Box>
          <Box flex="1">
            {row.details.status === PositionStatus.failed && (
              <RetryButton
                onClick={() => {
                  const marketSnapshot = snapshots2?.market[row.details.asset]
                  const overrideValues = getOrderValuesFromPosition({ userMarketSnapshot: row.details, marketSnapshot })
                  if (overrideValues) {
                    setOverrideValues(overrideValues)
                  }
                }}
              />
            )}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Box>
      {/* TODO make accordion body lazy */}
      <AccordionPanel pb={4} bg={subPositionBg}>
        <CurrentSubPositionsTable {...row} />
      </AccordionPanel>
    </AccordionItem>
  )
}

const CurrentSubPositionsTable = (row: PositionTableData) => {
  const {
    asset,
    details: { side },
  } = row
  // TODO: handle pagination
  const { data: history } = useActiveSubPositionHistory(asset)
  const { borderColor } = useStyles()
  const copy = usePositionManagerCopy()

  if (!history) return null

  const changes = history.pages
    .map((p) => p?.changes)
    .flat()
    .filter(notEmpty)
  const liquidation = changes.find((c) => c.protect)
  const liquidationFee = BigOrZero(liquidation?.collateral)

  return (
    <Box>
      <Flex marginBottom={1} alignItems="center" justifyContent="center">
        <Text variant="label" flex="1">
          {copy.date}
        </Text>
        <Text variant="label" flex="1">
          {copy.size}
        </Text>
        <Text variant="label" flex="1">
          {copy.change}
        </Text>
        <Text variant="label" flex="1">
          {copy.collateral}
        </Text>
        <Text variant="label" flex="1">
          {copy.executionPrice}
        </Text>
        <Text variant="label" flex="1">
          {copy.fees}
        </Text>
        <Text variant="label" flex="1">
          {copy.pnl}
        </Text>
      </Flex>
      {changes.map((change, i) => (
        <Box
          key={`${change.transactionHash}_${i}`}
          borderBottom={i < changes.length - 1 ? `1px solid ${borderColor}` : ''}
        >
          <SubPositionRow
            asset={asset}
            change={change}
            liquidation={i === 0 && !!liquidation}
            liquidationFee={i === 0 ? liquidationFee : 0n}
            side={side}
            changeIndex={i}
          />
        </Box>
      ))}
    </Box>
  )
}
