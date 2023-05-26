import React from 'react'

import { useMarketContext } from '@/contexts/marketContext'

import { Table } from '@ds/Table'

import { OpenPositionTableData } from '../constants'
import { useOpenPositionTableData } from '../hooks'
import { useOpenPositionColumns } from './hooks'

function AllPositions() {
  const { setSelectedMarket, selectedMarket } = useMarketContext()
  const tableData = useOpenPositionTableData()
  const columns = useOpenPositionColumns()
  const handleRowClick = (row: OpenPositionTableData) => {
    if (row.asset === selectedMarket) return
    setSelectedMarket(row.asset)
  }
  return <Table<OpenPositionTableData> columns={columns} data={tableData} handleRowClick={handleRowClick} />
}

export default AllPositions
