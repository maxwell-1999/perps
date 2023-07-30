import React from 'react'

import { LoadingScreen } from '@/components/shared/components'
import { SupportedMakerMarket } from '@/constants/assets'
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
  const {
    setSelectedMarket,
    setOrderDirection,
    setActivePositionTab,
    selectedMarket,
    orderDirection,
    isMaker,
    selectedMakerMarket,
    setSelectedMakerMarket,
  } = useMarketContext()
  const { positions: tableData, status } = useOpenPositionTableData()
  const handleRowClick = (row: PositionTableData) => {
    setActivePositionTab(PositionsTab.current)
    if (!isMaker) {
      if (row.asset === selectedMarket && row.details.direction === orderDirection) return
      setSelectedMarket(row.asset)
      setOrderDirection(row.details.direction ?? OrderDirection.Long)
    } else {
      const { asset, direction } = row.details
      const makerMarket = `${asset}-${direction}` as SupportedMakerMarket
      if (makerMarket === selectedMakerMarket) return
      setSelectedMakerMarket(makerMarket)
    }
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
