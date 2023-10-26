import { useBreakpointValue } from '@chakra-ui/react'
import React from 'react'

import { LoadingScreen } from '@/components/shared/components'
import { useAddress } from '@/hooks/network'

import { TableEmptyScreen } from '../components'
import { useHandleRowClick, useOpenPositionTableData, usePositionManagerCopy } from '../hooks'
import { AllPositionsTable } from './AllPositionTable'

function AllPositions() {
  const { noCurrentPositions, connectWalletPositions } = usePositionManagerCopy()
  const { address } = useAddress()
  const { positions: tableData, status } = useOpenPositionTableData()
  const handleRowClick = useHandleRowClick()
  const isBase = useBreakpointValue({ base: true, tableBreak: false })

  if (!address) return <TableEmptyScreen message={connectWalletPositions} />

  if (status === 'loading') {
    return <LoadingScreen />
  }

  return (
    <AllPositionsTable
      positions={tableData}
      onClick={handleRowClick}
      emptyStateMessage={noCurrentPositions}
      isBase={isBase}
    />
  )
}

export default AllPositions
