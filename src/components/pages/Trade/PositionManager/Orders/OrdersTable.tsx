import { CloseIcon } from '@chakra-ui/icons'
import { Box, Flex, IconButton, Link, Spinner, Text } from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { Address } from 'viem'

import { Badge } from '@/components/design-system/Badge'
import { TooltipText } from '@/components/design-system/Tooltip'
import colors from '@/components/design-system/theme/colors'
import { useTransactionToasts } from '@/components/shared/Toast/transactionToasts'
import { AssetMetadata, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { useCancelOrder } from '@/hooks/markets2'
import { Big6Math } from '@/utils/big6Utils'
import { getOpenOrderLabel, getOrderValuesFromPosition, isOpenOrderValid } from '@/utils/positionUtils'

import { AssetDirectionLabel, RetryButton, Status, StatusCell, TableEmptyScreen } from '../components'
import { PositionTableData } from '../constants'
import { FormattedOpenOrder, usePnl2, usePositionManagerCopy, useStyles } from '../hooks'

export const OrdersTable = ({
  positions,
  onClick,
  emptyStateMessage,
  openOrders,
}: {
  positions: Array<PositionTableData | FormattedOpenOrder>
  onClick?: (row: PositionTableData) => void
  emptyStateMessage: string
  openOrders: FormattedOpenOrder[]
}) => {
  const { isMaker } = useMarketContext()
  const { background } = useStyles()
  const copy = usePositionManagerCopy()
  const onCancelOrder = useCancelOrder()

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
        <Text variant="label" flex="3">
          {copy.market}
        </Text>
        <Text variant="label" flex="2">
          {copy.type}
        </Text>
        <Text variant="label" flex="2">
          {copy.size}
        </Text>
        <Text variant="label" flex="2">
          {copy.triggerPrice}
        </Text>
        <Text variant="label" flex="2">
          {copy.maxFee}
        </Text>
        {isMaker && (
          <Text variant="label" flex="2">
            {copy.exposure}
          </Text>
        )}
        <Text variant="label" flex="2">
          {copy.status}
        </Text>
        <Box flex="1" />
      </Flex>
      {Boolean(positions.length) ? (
        positions.map((position, i) => {
          if ('transactionHash' in position) {
            return (
              <OpenOrderTableRow
                key={`order-table-item-${position.nonce}`}
                borderBottom={i !== positions.length - 1}
                onCancelOrder={onCancelOrder}
                allOrders={openOrders}
                order={position}
              />
            )
          } else {
            return (
              <PositionTableRow
                key={`position-table-item-${i}`}
                row={position}
                onClick={onClick}
                borderBottom={i !== positions.length - 1}
              />
            )
          }
        })
      ) : (
        <TableEmptyScreen message={emptyStateMessage} />
      )}
    </Box>
  )
}

const PositionTableRow = ({
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
  const isClosingOrFailed =
    row.details.status === PositionStatus.closing ||
    row.details.status === PositionStatus.syncError ||
    row.details.status === PositionStatus.failed

  return (
    <Flex
      px={4}
      py={2}
      borderBottom={borderBottom ? `1px solid ${colors.brand.whiteAlpha[15]}` : undefined}
      height="59px"
    >
      <Flex flex="3">
        <Link
          onClick={() => (onClick ? onClick(row) : undefined)}
          _hover={!onClick ? { textDecoration: 'none' } : undefined}
        >
          <AssetDirectionLabel
            market={market}
            direction={isClosingOrFailed ? row.details.side : row.details.nextSide}
          />
        </Link>
      </Flex>
      <Flex flex="2" alignItems="center">
        {/* Hardcoding to market for now */}
        <Badge variant="purple" text="Market" />
      </Flex>
      <Flex flex="2">
        <Flex flexDirection="column">
          <Text fontSize="14px">
            {!isClosingOrFailed ? row.nextPosition : row.position} {row.asset.toUpperCase()}
          </Text>
          <Text variant="label" fontSize="12px">
            {!isClosingOrFailed ? row.nextNotional : row.notional}
          </Text>
        </Flex>
      </Flex>

      <Box flex="2" pt={2}>
        <Text fontSize="14px">{copy.noValue}</Text>
      </Box>
      <Flex flex="2">
        <Text fontSize="14px">{copy.noValue}</Text>
      </Flex>
      {isMaker && (
        <Box flex="2">
          <Text fontSize="14px">{row.makerExposure || copy.noValue}</Text>
        </Box>
      )}
      <Flex flex="2">
        <Status userMarketSnapshot={row.details} liquidated={!!pnlData?.liquidation} isMaker={isMaker} />
      </Flex>
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

const OpenOrderTableRow = ({
  onCancelOrder,
  borderBottom,
  allOrders,
  order,
}: {
  order: FormattedOpenOrder
  borderBottom?: boolean
  onCancelOrder: (orders: [Address, bigint][]) => Promise<`0x${string}` | undefined>
  allOrders: FormattedOpenOrder[]
}) => {
  const { side, orderDelta, triggerPrice, market, marketAddress, nonce, projectedFee, orderDeltaNotional, type } = order
  const copy = usePositionManagerCopy()
  const { isMaker, snapshots2 } = useMarketContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const marketMetadata = AssetMetadata[market]
  const orderLabel = getOpenOrderLabel({
    orderDelta: Big6Math.fromFloatString(orderDelta),
    comparison: type,
    orderDirection: side,
    isMaker,
  })
  const badgeVariant = orderLabel === 'stopLoss' ? 'purple' : 'green'

  const userMarketSnapshot = snapshots2?.user?.[market]
  const isValid = useMemo(
    () =>
      isOpenOrderValid({
        allOrders,
        order: order,
        userMarketSnapshot: userMarketSnapshot,
      }),
    [allOrders, order, userMarketSnapshot],
  )

  const { waitForTransactionAlert } = useTransactionToasts()

  const onCancel = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      setIsSubmitting(true)
      try {
        const hash = await onCancelOrder([[marketAddress, nonce]])
        if (hash) {
          waitForTransactionAlert(hash, {
            onSuccess: () => {
              setIsSubmitting(false)
              setIsCancelled(true)
            },
            onError: () => {
              setIsSubmitting(false)
            },
          })
        }
      } catch (err) {
        setIsSubmitting(false)
      }
    },
    [setIsSubmitting, onCancelOrder, marketAddress, nonce, waitForTransactionAlert, setIsCancelled],
  )

  return (
    <Flex
      px={4}
      py={2}
      borderBottom={borderBottom ? `1px solid ${colors.brand.whiteAlpha[15]}` : undefined}
      height="59px"
    >
      <Flex flex="3">
        <AssetDirectionLabel market={marketMetadata} direction={side} />
      </Flex>
      <Flex flex="2" alignItems="center">
        <Badge variant={badgeVariant} text={copy[orderLabel]} />
      </Flex>
      <Flex flex="2" alignItems="center">
        <Flex flexDirection="column">
          {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
          <Text fontSize="14px">{`${orderDelta} ${market.toUpperCase()}`}</Text>
          <Text variant="label" fontSize="12px">
            {orderDeltaNotional}
          </Text>
        </Flex>
      </Flex>
      <Flex flex="2" alignItems="center">
        <Text fontSize="14px">{triggerPrice}</Text>
      </Flex>
      <Flex flex="2" alignItems="center">
        <Text fontSize="14px">{projectedFee}</Text>
      </Flex>
      <Flex flex="2" alignItems="center">
        {isCancelled ? (
          <Text fontSize="14px" color={colors.brand.red}>
            {copy.cancelled}
          </Text>
        ) : (
          <StatusCell
            statusColor={isValid ? colors.brand.green : colors.brand.red}
            statusLabel={
              isValid ? (
                copy.placed
              ) : (
                <TooltipText fontSize="14px" ml={3} tooltipText={copy.invalidOrderMsg}>
                  {copy.invalid}
                </TooltipText>
              )
            }
            glow
          />
        )}
      </Flex>
      <Box flex="1">
        {!isCancelled && (
          <IconButton
            bg="none"
            border="none"
            isDisabled={isSubmitting}
            _hover={{
              bg: colors.brand.whiteAlpha[10],
            }}
            icon={
              isSubmitting ? (
                <Spinner height="10px" width="10px" />
              ) : (
                <CloseIcon color={colors.brand.red} height="10px" width="10px" />
              )
            }
            onClick={onCancel}
            aria-label={copy.retry}
            alt-text={copy.retry}
          />
        )}
      </Box>
    </Flex>
  )
}
