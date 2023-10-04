import { Box, Flex, Link, Text } from '@chakra-ui/react'

import { Badge } from '@/components/design-system/Badge'
import colors from '@/components/design-system/theme/colors'
import { AssetMetadata, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { getOrderValuesFromPosition } from '@/utils/positionUtils'

import { AssetDirectionLabel, RetryButton, Status, TableEmptyScreen } from '../components'
import { PositionTableData } from '../constants'
import { usePnl2, usePositionManagerCopy, useStyles } from '../hooks'

export const OrdersTable = ({
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

  return (
    <Box height="28px">
      <Flex
        alignItems="center"
        justifyContent="center"
        py="5px"
        px={4}
        position="sticky"
        top={0}
        background={background}
        borderBottom={`1px solid ${colors.brand.whiteAlpha[15]}`}
      >
        <Text variant="label" flex="2">
          {copy.status}
        </Text>
        <Text variant="label" flex="2">
          {copy.type}
        </Text>
        <Text variant="label" flex="2">
          {copy.size}
        </Text>
        <Text variant="label" flex="3">
          {copy.market}
        </Text>
        <Text variant="label" flex="2">
          {copy.leverage}
        </Text>
        <Text variant="label" flex="2">
          {copy.openLiq}
        </Text>
        {isMaker && (
          <Text variant="label" flex="2">
            {copy.exposure}
          </Text>
        )}
        <Box flex="1" />
      </Flex>
      {Boolean(positions.length) ? (
        positions.map((position, i) => (
          <OrdersTableRow key={i} row={position} onClick={onClick} borderBottom={i !== positions.length - 1} />
        ))
      ) : (
        <TableEmptyScreen message={emptyStateMessage} />
      )}
    </Box>
  )
}

const OrdersTableRow = ({
  row,
  onClick,
  borderBottom,
}: {
  row: PositionTableData
  onClick?: (row: PositionTableData) => void
  borderBottom?: boolean
}) => {
  const { isMaker, setOverrideValues, snapshots2 } = useMarketContext()
  const copy = usePositionManagerCopy()
  const market = AssetMetadata[row.asset]
  const pnlData = usePnl2(row.details)
  const isClosing = row.details.status === PositionStatus.closing

  return (
    <Flex
      px={4}
      py={2}
      borderBottom={borderBottom ? `1px solid ${colors.brand.whiteAlpha[15]}` : undefined}
      height="59px"
    >
      <Flex flex="2">
        <Status userMarketSnapshot={row.details} liquidated={!!pnlData?.liquidation} isMaker={isMaker} />
      </Flex>
      <Flex flex="2" alignItems="center">
        {/* Hardcoding to market for now */}
        <Badge variant="purple" text="Market" />
      </Flex>
      <Flex flex="2">
        <Flex flexDirection="column">
          <Text fontSize="14px">
            {!isClosing ? row.nextPosition : row.position} {row.asset.toUpperCase()}
          </Text>
          <Text variant="label" fontSize="12px">
            {!isClosing ? row.nextNotional : row.notional}
          </Text>
        </Flex>
      </Flex>
      <Flex flex="3">
        <Link
          onClick={() => (onClick ? onClick(row) : undefined)}
          _hover={!onClick ? { textDecoration: 'none' } : undefined}
        >
          <AssetDirectionLabel
            hideIcon
            market={market}
            direction={isClosing ? row.details.side : row.details.nextSide}
          />
        </Link>
      </Flex>
      <Box flex="2" pt={2}>
        <Badge variant="default">
          <Text as="span" fontSize="13px">
            {isClosing ? row.leverage : row.nextLeverage}
            {copy.x}
          </Text>
        </Badge>
      </Box>
      <Flex flex="2">
        <Flex flexDirection="column">
          <Text fontSize="14px">{pnlData?.averageEntryPriceFormatted}</Text>
          <Text variant="label" fontSize="12px">
            {row.liquidationPrice}
          </Text>
        </Flex>
      </Flex>
      {isMaker && (
        <Box flex="2">
          <Text fontSize="14px">{row.makerExposure || copy.noValue}</Text>
        </Box>
      )}
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
    </Flex>
  )
}
