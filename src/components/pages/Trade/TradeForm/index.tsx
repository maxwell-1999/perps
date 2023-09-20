import { Flex, Spinner } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'

import { OrderDirection, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { useUserCurrentPositions } from '@/hooks/markets'
import { useAddress } from '@/hooks/network'
import { closedOrResolved } from '@/utils/positionUtils'

import { Container } from '@ds/Container'

import { PositionSide } from '@t/gql/graphql'

import ClosePositionForm from './components/ClosePositionForm'
import TradeForm from './components/TradeForm'
import WithdrawCollateralForm from './components/WithdrawCollateralForm'
import { useResetFormOnMarketChange } from './hooks'
import { getContainerVariant, getPositionFromSelectedMarket } from './utils'

const Long = OrderDirection.Long
const Short = OrderDirection.Short

function TradeContainer() {
  const { formState, setTradeFormState } = useTradeFormState()
  const {
    selectedMarket,
    orderDirection,
    setOrderDirection,
    selectedMarketSnapshot,
    selectedMakerMarket,
    selectedMakerMarketSnapshot,
    isMaker,
    makerAsset,
    makerOrderDirection,
  } = useMarketContext()
  const { data: positions, isInitialLoading: positionsLoading } = useUserCurrentPositions()
  const { address } = useAddress()

  useResetFormOnMarketChange({ setTradeFormState, selectedMarket, formState, selectedMakerMarket, isMaker })

  const product = isMaker ? selectedMakerMarketSnapshot : selectedMarketSnapshot?.[orderDirection]
  const position = getPositionFromSelectedMarket({
    positions,
    selectedMarket,
    orderDirection,
    isMaker,
    selectedMakerMarket,
  })
  const oppositeSidePosition = positions?.[selectedMarket]?.[orderDirection === Long ? Short : Long]

  useEffect(() => {
    if (isMaker) return
    // If this position is closed/resolve and the other side is not, switch to that side
    if (
      closedOrResolved(position?.status) &&
      position?.side === PositionSide.Taker &&
      !closedOrResolved(oppositeSidePosition?.status) &&
      oppositeSidePosition?.side === PositionSide.Taker
    ) {
      setOrderDirection(orderDirection === Long ? Short : Long)
    }
  }, [orderDirection, position, oppositeSidePosition, setOrderDirection, isMaker])

  // If data is loaded and one side is undefined, switch to the other side. This happens when only one side of the market is available
  useEffect(() => {
    if (isMaker) return
    if (!product && !!selectedMarketSnapshot?.[orderDirection === Long ? Short : Long]) {
      setOrderDirection(orderDirection === Long ? Short : Long)
    }
  }, [product, orderDirection, selectedMarketSnapshot, setOrderDirection, isMaker])

  const crossCollateral = useMemo(() => {
    // If this position is closed/resolved and the other side has collateral, mark it as cross collateral
    if (closedOrResolved(position?.status) && oppositeSidePosition?.status === PositionStatus.closed && !isMaker)
      return oppositeSidePosition?.currentCollateral ?? 0n
    return 0n
  }, [position, oppositeSidePosition, isMaker])

  const containerVariant = getContainerVariant(formState, !!closedOrResolved(position?.status), !address)

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
      {[FormState.trade, FormState.modify].includes(formState) && (
        <TradeForm
          asset={isMaker ? makerAsset : selectedMarket}
          orderDirection={isMaker ? makerOrderDirection : orderDirection}
          setOrderDirection={setOrderDirection}
          singleDirection={!selectedMarketSnapshot?.[orderDirection === Long ? Short : Long]}
          product={product}
          position={
            !isMaker
              ? position?.side === PositionSide.Taker || closedOrResolved(position?.status)
                ? position
                : undefined
              : position?.side === PositionSide.Maker || closedOrResolved(position?.status)
              ? position
              : undefined
          }
          crossCollateral={crossCollateral}
          crossProduct={oppositeSidePosition?.product}
        />
      )}
      {formState === FormState.close && position && (
        <ClosePositionForm
          asset={isMaker ? makerAsset : selectedMarket}
          position={position}
          product={product}
          crossCollateral={crossCollateral}
        />
      )}
      {formState === FormState.withdraw && position && (
        <WithdrawCollateralForm asset={isMaker ? makerAsset : selectedMarket} position={position} product={product} />
      )}
    </Container>
  )
}

export default TradeContainer
