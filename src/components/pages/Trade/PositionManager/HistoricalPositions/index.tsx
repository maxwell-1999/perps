import { Box, Flex } from '@chakra-ui/react'
import React from 'react'

import { Button } from '@/components/design-system'
import { LoadingScreen } from '@/components/shared/components'
import { useAddress } from '@/hooks/network'

import { PositionTable } from '../PositionTable'
import { TableEmptyScreen } from '../components'
import { usePositionHistoryTableData, usePositionManagerCopy } from '../hooks'

function AllPositions() {
  const copy = usePositionManagerCopy()
  const { address } = useAddress()
  const { positions, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage, status } = usePositionHistoryTableData()

  if (!address) return <TableEmptyScreen message={copy.connectWalletHistory} />

  if (status === 'loading') {
    return <LoadingScreen />
  }

  return (
    <Box>
      <Box>
        <PositionTable positions={positions} emptyStateMessage={copy.noHistoryPositions} />
      </Box>
      <Flex justifyContent="center" alignContent="center">
        {(hasNextPage || isLoading) && (
          <Button
            disabled={isLoading || isFetchingNextPage}
            isLoading={isLoading || isFetchingNextPage}
            onClick={() => fetchNextPage()}
            label={copy.loadMore}
            variant="text"
          >
            {copy.loadMore}
          </Button>
        )}
      </Flex>
    </Box>
  )
}

export default AllPositions
