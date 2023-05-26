import { Flex, Text } from '@chakra-ui/react'
import { Row } from 'react-table'

import { AssetIconWithText } from '@/components/shared/components'
import { AssetMetadata } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'

import { Column } from '@ds/Table'

import { OpenPositionTableData } from '../constants'
import { usePnl, usePositionManagerCopy, useStyles } from '../hooks'

const PnlCell = (row: OpenPositionTableData) => {
  const { isPnlPositive, pnl, pnlPercentage } = usePnl({ asset: row.asset, positionDetails: row.details })
  const { green, red } = useStyles()
  const pnlColor = isPnlPositive ? green : red
  return (
    <Flex flexDirection="column">
      <Text fontSize="13px" color={pnlColor}>
        {pnlPercentage}
      </Text>
      <Text variant="label" fontSize="11px">
        {pnl}
      </Text>
    </Flex>
  )
}

export const useOpenPositionColumns = () => {
  const copy = usePositionManagerCopy()
  const { green, red } = useStyles()
  const columns: Column<OpenPositionTableData>[] = [
    {
      Header: copy.market,
      accessor: 'asset',
      disableSortBy: true,
      renderer: (row: OpenPositionTableData) => {
        const market = AssetMetadata[row.asset]
        const directionColor = row.details.direction === OrderDirection.Long ? green : red
        return (
          <Flex alignItems="center">
            <AssetIconWithText market={market} fontSize="15px" mr="10px" />
            <Text fontSize="14px" color={directionColor}>
              {row.details.direction}
            </Text>
          </Flex>
        )
      },
    },
    {
      Header: copy.size,
      accessor: 'unformattedNotional',
      sortType: (rowA: Row, rowB: Row, id: string) => {
        const a = parseFloat(rowA.values[id])
        const b = parseFloat(rowB.values[id])
        if (a > b) {
          return 1
        }
        if (b > a) {
          return -1
        }
        return 0
      },
      renderer: (row: OpenPositionTableData) => (
        <Flex flexDirection="column">
          <Text fontSize="13px">
            {row.position} {row.asset.toUpperCase()}
          </Text>
          <Text variant="label" fontSize="11px">
            {row.notional}
          </Text>
        </Flex>
      ),
    },
    {
      Header: copy.pnl,
      accessor: 'details',
      disableSortBy: true,
      renderer: (row: OpenPositionTableData) => {
        return <PnlCell {...row} />
      },
    },
    {
      Header: copy.liquidation,
      accessor: 'unformattedLiquidationPrice',
      disableSortBy: true,
      renderer: (row: OpenPositionTableData) => <Text fontSize="13px">{row.liquidationPrice}</Text>,
    },
  ]

  return columns
}
