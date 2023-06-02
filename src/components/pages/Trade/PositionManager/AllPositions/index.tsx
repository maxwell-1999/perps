import React from 'react'

import { OrderDirection } from '@/constants/markets'
import { PositionsTab, useMarketContext } from '@/contexts/marketContext'

import { PositionTable } from '../components'
import { PositionTableData } from '../constants'
import { useOpenPositionTableData } from '../hooks'

function AllPositions() {
  const { setSelectedMarket, setOrderDirection, setActivePositionTab, selectedMarket, orderDirection } =
    useMarketContext()
  const tableData = useOpenPositionTableData()
  const handleRowClick = (row: PositionTableData) => {
    setActivePositionTab(PositionsTab.current)
    if (row.asset === selectedMarket && row.details.direction === orderDirection) return
    setSelectedMarket(row.asset)
    setOrderDirection(row.details.direction ?? OrderDirection.Long)
  }

  return <PositionTable positions={tableData} onClick={handleRowClick} currentPosition />
}

export default AllPositions
