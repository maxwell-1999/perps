import React, { useMemo } from 'react'

import { LoadingScreen } from '@/components/shared/components'
import { PositionSide2, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { useAddress } from '@/hooks/network'

import { TableEmptyScreen } from '../components'
import { useHandleRowClick, useOpenOrderTableData, useOpenPositionTableData, usePositionManagerCopy } from '../hooks'
import { OrdersTable } from './OrdersTable'

function AllPositions() {
  const { connectWalletPositions, noCurrentOrdersToShow } = usePositionManagerCopy()
  const { address } = useAddress()
  const { positions: tableData, status } = useOpenPositionTableData()
  const openOrders = useOpenOrderTableData()
  const { isMaker } = useMarketContext()
  const handleRowClick = useHandleRowClick()

  const filteredOrders = useMemo(() => {
    const transitionPositionStates = [
      PositionStatus.opening,
      PositionStatus.failed,
      PositionStatus.pricing,
      PositionStatus.closing,
    ]
    const filteredPositions = tableData.filter((position) => {
      const isTransitional = transitionPositionStates.includes(position.details.status)
      if (isMaker) {
        return (
          isTransitional &&
          (position.details.side === PositionSide2.maker || position.details.nextSide === PositionSide2.maker)
        )
      }
      return (
        isTransitional &&
        position.details.side !== PositionSide2.maker &&
        position.details.nextSide !== PositionSide2.maker
      )
    })

    return [...filteredPositions, ...openOrders]
  }, [tableData, openOrders, isMaker])

  if (!address) return <TableEmptyScreen message={connectWalletPositions} />

  if (status === 'loading') {
    return <LoadingScreen />
  }

  return (
    <OrdersTable
      positions={filteredOrders}
      onClick={handleRowClick}
      emptyStateMessage={noCurrentOrdersToShow}
      openOrders={openOrders}
    />
  )
}

export default AllPositions
