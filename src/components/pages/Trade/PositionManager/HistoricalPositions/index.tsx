import { Box, Flex } from '@chakra-ui/react'
import React from 'react'

import { Button } from '@/components/design-system'
import { LoadingScreen } from '@/components/shared/components'

import { PositionTable } from '../PositionTable'
import { usePositionHistoryTableData, usePositionManagerCopy } from '../hooks'

function AllPositions() {
  const copy = usePositionManagerCopy()
  const { positions, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage, status } = usePositionHistoryTableData()

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
