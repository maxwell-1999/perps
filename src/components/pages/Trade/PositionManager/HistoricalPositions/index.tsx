import { Box, Flex } from '@chakra-ui/react'
import React from 'react'

import { Button } from '@/components/design-system'
import { LoadingScreen } from '@/components/shared/components'
import { useMarketContext } from '@/contexts/marketContext'
import { useHistoricalPositions } from '@/hooks/markets2'
import { useAddress } from '@/hooks/network'
import { notEmpty } from '@/utils/arrayUtils'

import { TableEmptyScreen } from '../components'
import { usePositionManagerCopy } from '../hooks'
import { HistoricalPositionsTable } from './HistoricalPositionTable'

function AllPositions() {
  const { isMaker } = useMarketContext()
  const copy = usePositionManagerCopy()
  const { address } = useAddress()
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, status } = useHistoricalPositions(isMaker)

  if (!address) return <TableEmptyScreen message={copy.connectWalletHistory} />

  if (status === 'loading') {
    return <LoadingScreen />
  }

  const positions =
    data?.pages
      .map((page) => page?.positions)
      .flat()
      .filter(notEmpty) ?? []

  return (
    <Box>
      <Box>
        <HistoricalPositionsTable positions={positions} emptyStateMessage={copy.noHistoryPositions} />
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
