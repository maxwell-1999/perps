import React from 'react'

import { PositionsTab, useMarketContext } from '@/contexts/marketContext'

import { Table } from '@ds/Table'

import { OpenPositionTableData } from '../constants'
import { useOpenPositionTableData } from '../hooks'
import { useOpenPositionColumns } from './hooks'

function AllPositions() {
  const { setSelectedMarket, setOrderSide, setActivePositionTab, selectedMarket, orderSide } = useMarketContext()
  const tableData = useOpenPositionTableData()
  const columns = useOpenPositionColumns()
  const handleRowClick = (row: OpenPositionTableData) => {
    setActivePositionTab(PositionsTab.current)
    if (row.asset === selectedMarket && row.side === orderSide) return
    setSelectedMarket(row.asset)
    setOrderSide(row.side)
  }
  return <Table<OpenPositionTableData> columns={columns} data={tableData} handleRowClick={handleRowClick} />
}

export default AllPositions
