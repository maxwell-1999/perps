import React from 'react'

import { OrderDirection } from '@/constants/markets'
import { PositionsTab, useMarketContext } from '@/contexts/marketContext'

import { Table } from '@ds/Table'

import { OpenPositionTableData } from '../constants'
import { useOpenPositionTableData } from '../hooks'
import { useOpenPositionColumns } from './hooks'

function AllPositions() {
  const { setSelectedMarket, setOrderDirection, setActivePositionTab, selectedMarket, orderDirection } =
    useMarketContext()
  const tableData = useOpenPositionTableData()
  const columns = useOpenPositionColumns()
  const handleRowClick = (row: OpenPositionTableData) => {
    setActivePositionTab(PositionsTab.current)
    if (row.asset === selectedMarket && row.details.direction === orderDirection) return
    setSelectedMarket(row.asset)
    setOrderDirection(row.details.direction ?? OrderDirection.Long)
  }
  return <Table<OpenPositionTableData> columns={columns} data={tableData} handleRowClick={handleRowClick} />
}

export default AllPositions
