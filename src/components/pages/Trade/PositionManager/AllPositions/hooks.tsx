import { Flex, Text } from '@chakra-ui/react'

import { AssetIconWithText } from '@/components/shared/components'
import { AssetMetadata } from '@/constants/assets'

import { Column } from '@ds/Table'

import { OrderSide } from '../../TradeForm/constants'
import { OpenPositionTableData } from '../constants'
import { usePositionManagerCopy, useStyles } from '../hooks'

export const useOpenPositionColumns = () => {
  const copy = usePositionManagerCopy()
  const { green, red } = useStyles()
  const columns: Column<OpenPositionTableData>[] = [
    {
      Header: copy.market,
      accessor: 'asset',
      renderer: (row: OpenPositionTableData) => {
        const market = AssetMetadata[row.asset]
        const sideColor = row.side === OrderSide.Long ? green : red
        return (
          <Flex alignItems="center">
            <AssetIconWithText market={market} fontSize="15px" mr="10px" />
            <Text fontSize="14px" color={sideColor}>
              {row.side}
            </Text>
          </Flex>
        )
      },
    },
    {
      Header: copy.size,
      accessor: 'position',
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
      accessor: 'pnl',
      renderer: (row: OpenPositionTableData) => {
        const pnlColor = row.isPnlPositive ? green : red
        return (
          <Flex flexDirection="column">
            <Text fontSize="13px" color={pnlColor}>
              {row.pnlPercentage}
            </Text>
            <Text variant="label" fontSize="11px">
              {row.pnl}
            </Text>
          </Flex>
        )
      },
    },
    {
      Header: copy.liquidation,
      accessor: 'liquidationPrice',
      renderer: (row: OpenPositionTableData) => <Text fontSize="13px">{row.liquidationPrice}</Text>,
    },
  ]

  return columns
}
