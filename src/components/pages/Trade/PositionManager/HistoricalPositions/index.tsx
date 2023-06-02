import { Box, Flex } from '@chakra-ui/react'
import React from 'react'

import { Button } from '@/components/design-system'

import { PositionTable } from '../components'
import { usePositionHistoryTableData, usePositionManagerCopy } from '../hooks'

function AllPositions() {
  const copy = usePositionManagerCopy()
  const { positions, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } = usePositionHistoryTableData()

  return (
    <Box>
      <Box>
        <PositionTable positions={positions} />
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
