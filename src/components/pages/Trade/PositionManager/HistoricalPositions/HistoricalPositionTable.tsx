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

import { TooltipText } from '@/components/design-system/Tooltip'
import { AssetIconWithText } from '@/components/shared/components'
import { AssetMetadata } from '@/constants/markets'
import { HistoricalPosition, useHistoricalSubPositions } from '@/hooks/markets2'
import { notEmpty } from '@/utils/arrayUtils'
import { Big6Math, formatBig6, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import { formatDateRelative } from '@/utils/timeUtils'

import colors from '@ds/theme/colors'

import {
  AssetDirectionLabel,
  MobileDataRow,
  RealizedAccumulationsTooltip,
  SubPositionRow,
  TableEmptyScreen,
} from '../components'
import { usePositionManagerCopy, useStyles } from '../hooks'

export const HistoricalPositionsTable = ({
  positions,
  onClick,
  emptyStateMessage,
}: {
  positions: HistoricalPosition[]
  onClick?: (row: HistoricalPosition) => void
  emptyStateMessage: string
}) => {
  const { background } = useStyles()
  const copy = usePositionManagerCopy()
  const isBase = useBreakpointValue({ base: true, tableBreak: false })

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
          <Text variant="label" flex="1">
            {copy.opened}
          </Text>
          <Text variant="label" flex="3">
            {copy.market}
          </Text>
          <Text variant="label" flex="2">
            {copy.openSize}
          </Text>
          <Text variant="label" flex="2">
            {copy.pnl}
          </Text>
          <Text variant="label" flex="2">
            {copy.averageEntry}
          </Text>
          <Text variant="label" flex="2">
            {copy.fees}
          </Text>
          {/* Box to take up the same space the accordion icon does */}
          <Box flexShrink="0" w="20px" h="20px" />
        </Flex>
      )}
      {Boolean(positions.length) ? (
        <Accordion allowMultiple>
          {positions.map((position, i) => (
            <HistoricalPositionsTableRow key={i} row={position} onClick={onClick} isBase={isBase} />
          ))}
        </Accordion>
      ) : (
        <TableEmptyScreen message={emptyStateMessage} />
      )}
    </Box>
  )
}

const HistoricalPositionsTableRow = ({
  row,
  onClick,
  isBase,
}: {
  row: HistoricalPosition
  onClick?: (row: HistoricalPosition) => void
  isBase?: boolean
}) => {
  const copy = usePositionManagerCopy()
  const { green, red, borderColor, alpha5, alpha20, alpha50 } = useStyles()
  const market = AssetMetadata[row.asset]
  const fees = row.keeperFees + row.positionFees + row.liquidationFee + row.interfaceFees + row.orderFees
  // Taker position fees are factored into avg entry price
  const displayedFees = row.side === 'maker' ? fees : fees - row.priceImpactFees
  const pnl = row.accumulated.value - fees
  const isPnlPositive = pnl > 0n
  const pnlPercentage = Big6Math.div(pnl, row.startCollateral + (row.netDeposits > 0n ? row.netDeposits : 0n))
  const openDate = formatDateRelative(row.startTime)

  const subPositionBg = useColorModeValue('white', 'black')
  const hoverColor = useColorModeValue(colors.brand.whiteAlpha[10], colors.brand.blackAlpha[10])
  // Adjust accumulated pnl to not include price impact fees
  const accumulated = {
    ...row.accumulated,
    value: row.side !== 'maker' ? row.accumulated.value - row.priceImpactFees : row.accumulated.value,
    pnl: row.side !== 'maker' ? row.accumulated.pnl - row.priceImpactFees : row.accumulated.value,
  }

  const pnlNode = (
    <RealizedAccumulationsTooltip side={row.side} values={accumulated} fees={displayedFees}>
      <Text fontSize="13px" color={isPnlPositive ? green : red}>
        {formatBig6USDPrice(pnl)}
      </Text>
    </RealizedAccumulationsTooltip>
  )

  if (isBase) {
    return (
      <AccordionItem>
        <AccordionButton height="50px">
          <Flex flexDirection="row" width="100%" justifyContent="space-between" alignItems="center">
            <Flex>
              <Text fontSize="13px" color={alpha50} mr={2}>
                {openDate}
              </Text>
              <AssetIconWithText market={AssetMetadata[row.asset]} size="sm" mr={2} />
            </Flex>

            <AccordionIcon />
          </Flex>
        </AccordionButton>
        <AccordionPanel pb={4} borderTop={`1px solid ${alpha20}`} bg="black">
          <MobileDataRow label={copy.opened} value={<Text fontSize="13px">{openDate}</Text>} />
          <MobileDataRow label={copy.market} value={<Text fontSize="13px">{market.symbol}</Text>} />
          <MobileDataRow label={copy.direction} value={<Text fontSize="13px">{row.side}</Text>} />
          <MobileDataRow
            label={copy.pnl}
            value={
              <Flex fontSize="13px" color={isPnlPositive ? green : red}>
                {pnlNode}
              </Flex>
            }
          />
          <MobileDataRow
            label={copy.size}
            value={
              <Text fontSize="13px">
                {formatBig6(row.startSize)} {row.asset.toUpperCase()}
              </Text>
            }
          />
          <MobileDataRow
            label={copy.open}
            value={<Text fontSize="13px">{formatBig6USDPrice(row.averageEntry)}</Text>}
          />
          <MobileDataRow label={copy.fees} value={<Text fontSize="13px">{formatBig6USDPrice(displayedFees)}</Text>} />
        </AccordionPanel>
      </AccordionItem>
    )
  }

  return (
    <AccordionItem borderBottom="none" _hover={{ bg: hoverColor }}>
      <Box>
        <AccordionButton textAlign="left" _expanded={{ borderBottom: `1px solid ${borderColor}`, background: alpha5 }}>
          <Box flex="1">
            <Text fontSize="14px" variant="label">
              {formatDateRelative(row.startTime)}
            </Text>
          </Box>
          <Box flex="3" display="flex">
            <Link
              onClick={() => (onClick ? onClick(row) : undefined)}
              _hover={!onClick ? { textDecoration: 'none' } : undefined}
            >
              <AssetDirectionLabel market={market} direction={row.side} />
            </Link>
          </Box>
          <Box flex="2">
            <Flex flexDirection="column">
              <Text fontSize="14px">
                {formatBig6(row.startSize)} {row.asset.toUpperCase()}
              </Text>
              <Text variant="label" fontSize="12px">
                {formatBig6USDPrice(Big6Math.mul(row.startSize, row.startPrice))}
              </Text>
            </Flex>
          </Box>
          <Box flex="2">
            <Flex flexDirection="column">
              <Flex fontSize="14px" color={isPnlPositive ? green : red}>
                {pnlNode}
              </Flex>
              <Text variant="label" fontSize="12px">
                {formatBig6Percent(pnlPercentage)}
              </Text>
            </Flex>
          </Box>
          <Box flex="2">
            <Text fontSize="14px">{formatBig6USDPrice(row.averageEntry)}</Text>
          </Box>
          <Box flex="2">
            {row.liquidation ? (
              <TooltipText
                tooltipText={copy.liquidationFeeTooltip(row.liquidationFee)}
                tooltipProps={{ placement: 'top-start' }}
                fontSize="14px"
              >
                {formatBig6USDPrice(displayedFees)}
              </TooltipText>
            ) : (
              <Text fontSize="14px">{formatBig6USDPrice(displayedFees)}</Text>
            )}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Box>
      {/* TODO make accordion body lazy */}
      <AccordionPanel pb={4} bg={subPositionBg}>
        <HistoricalSubPositionsTable {...row} />
      </AccordionPanel>
    </AccordionItem>
  )
}

const HistoricalSubPositionsTable = (row: HistoricalPosition) => {
  const { asset, liquidation, liquidationFee, side } = row
  // TODO: handle pagination
  const { data: history } = useHistoricalSubPositions({
    market: row.market,
    startVersion: row.startVersion.toString(),
    endVersion: row.endVersion.toString(),
  })
  const { borderColor } = useStyles()
  const copy = usePositionManagerCopy()

  if (!history) return null

  const changes = history.pages
    .map((p) => p?.changes)
    .flat()
    .filter(notEmpty)

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
