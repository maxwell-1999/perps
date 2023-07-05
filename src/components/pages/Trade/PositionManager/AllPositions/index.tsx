import React from 'react'

import { LoadingScreen } from '@/components/shared/components'
import { OrderDirection } from '@/constants/markets'
import { PositionsTab, useMarketContext } from '@/contexts/marketContext'
import { useAddress } from '@/hooks/network'

import { PositionTable } from '../PositionTable'
import { TableEmptyScreen } from '../components'
import { PositionTableData } from '../constants'
import { useOpenPositionTableData, usePositionManagerCopy } from '../hooks'

function AllPositions() {
  const { noCurrentPositions, connectWalletPositions } = usePositionManagerCopy()
  const { address } = useAddress()
  const { setSelectedMarket, setOrderDirection, setActivePositionTab, selectedMarket, orderDirection } =
    useMarketContext()
  const { positions: tableData, status } = useOpenPositionTableData()
  const handleRowClick = (row: PositionTableData) => {
    setActivePositionTab(PositionsTab.current)
    if (row.asset === selectedMarket && row.details.direction === orderDirection) return
    setSelectedMarket(row.asset)
    setOrderDirection(row.details.direction ?? OrderDirection.Long)
  }

  if (!address) return <TableEmptyScreen message={connectWalletPositions} />

  if (status === 'loading') {
    return <LoadingScreen />
  }

  return (
    <PositionTable
      positions={tableData}
      onClick={handleRowClick}
      currentPosition
      emptyStateMessage={noCurrentPositions}
    />
  )
}

export default AllPositions
