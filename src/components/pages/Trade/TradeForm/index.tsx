import { Flex, Spinner } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { OrderDirection, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { useUserCurrentPositions } from '@/hooks/markets'

import { Container } from '@ds/Container'

import ClosePositionForm from './components/ClosePositionForm'
import TradeForm from './components/TradeForm'
import { useResetFormOnMarketChange } from './hooks'

const Long = OrderDirection.Long
const Short = OrderDirection.Short

function TradeContainer() {
  const { formState, setTradeFormState } = useTradeFormState()
  const { selectedMarket, orderDirection, setOrderDirection, selectedMarketSnapshot } = useMarketContext()
  const { data: positions, isInitialLoading: positionsLoading } = useUserCurrentPositions()
  const { address } = useAccount()

  useResetFormOnMarketChange({ setTradeFormState, selectedMarket, formState })

  const product = selectedMarketSnapshot?.[orderDirection]
  const position = positions?.[selectedMarket]?.[orderDirection]
  const oppositeSidePosition = positions?.[selectedMarket]?.[orderDirection === Long ? Short : Long]

  useEffect(() => {
    if (position?.status === PositionStatus.resolved && oppositeSidePosition?.status !== PositionStatus.resolved)
      setOrderDirection(orderDirection === Long ? OrderDirection.Short : OrderDirection.Long)
  }, [orderDirection, position, oppositeSidePosition, setOrderDirection])

  const containerVariant =
    formState !== FormState.close && position && position.status !== PositionStatus.resolved ? 'pink' : 'transparent'

  if (!product || (address && positionsLoading)) {
    return (
      <Container height="100%" minHeight="560px" p="0" variant={containerVariant}>
        <Flex height="100%" width="100%" justifyContent="center" alignItems="center">
          <Spinner />
        </Flex>
      </Container>
    )
  }

  return (
    <Container height="100%" minHeight="560px" p="0" variant={containerVariant}>
      {!product && (
        <Flex height="100%" width="100%" justifyContent="center" alignItems="center">
          <Spinner />
        </Flex>
      )}
      {formState !== FormState.close && (
        <TradeForm
          asset={selectedMarket}
          orderDirection={orderDirection}
          setOrderDirection={setOrderDirection}
          product={product}
          position={position?.side === 'taker' ? position : undefined}
        />
      )}
      {formState === FormState.close && position && (
        <ClosePositionForm asset={selectedMarket} position={position} product={product} />
      )}
    </Container>
  )
}

export default TradeContainer
