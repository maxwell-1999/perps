import { Flex, Spinner } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'

import { OrderDirection, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { useUserCurrentPositions } from '@/hooks/markets'
import { useAddress } from '@/hooks/network'
import { closedOrResolved } from '@/utils/positionUtils'

import { Container } from '@ds/Container'

import ClosePositionForm from './components/ClosePositionForm'
import TradeForm from './components/TradeForm'
import WithdrawCollateralForm from './components/WithdrawCollateralForm'
import { useResetFormOnMarketChange } from './hooks'

const Long = OrderDirection.Long
const Short = OrderDirection.Short

function TradeContainer() {
  const { formState, setTradeFormState } = useTradeFormState()
  const { selectedMarket, orderDirection, setOrderDirection, selectedMarketSnapshot } = useMarketContext()
  const { data: positions, isInitialLoading: positionsLoading } = useUserCurrentPositions()
  const { address } = useAddress()

  useResetFormOnMarketChange({ setTradeFormState, selectedMarket, formState })

  const product = selectedMarketSnapshot?.[orderDirection]
  const position = positions?.[selectedMarket]?.[orderDirection]
  const oppositeSidePosition = positions?.[selectedMarket]?.[orderDirection === Long ? Short : Long]

  useEffect(() => {
    // If this position is closed/resolve and the other side is not, switch to that side
    if (closedOrResolved(position?.status) && !closedOrResolved(oppositeSidePosition?.status))
      setOrderDirection(orderDirection === Long ? OrderDirection.Short : OrderDirection.Long)
  }, [orderDirection, position, oppositeSidePosition, setOrderDirection])

  const crossCollateral = useMemo(() => {
    // If this position is closed/resolved and the other side has collateral, mark it as cross collateral
    if (closedOrResolved(position?.status) && oppositeSidePosition?.status === PositionStatus.closed)
      return oppositeSidePosition?.currentCollateral ?? 0n
    return 0n
  }, [position, oppositeSidePosition])

  const containerVariant = formState !== FormState.close && !closedOrResolved(position?.status) ? 'pink' : 'transparent'

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
      {[FormState.trade, FormState.modify].includes(formState) && (
        <TradeForm
          asset={selectedMarket}
          orderDirection={orderDirection}
          setOrderDirection={setOrderDirection}
          product={product}
          position={position?.side === 'taker' ? position : undefined}
          crossCollateral={crossCollateral}
          crossProduct={oppositeSidePosition?.product}
        />
      )}
      {formState === FormState.close && position && (
        <ClosePositionForm asset={selectedMarket} position={position} product={product} />
      )}
      {formState === FormState.withdraw && position && (
        <WithdrawCollateralForm asset={selectedMarket} position={position} product={product} />
      )}
    </Container>
  )
}

export default TradeContainer
