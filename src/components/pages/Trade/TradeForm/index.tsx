import { Flex, Spinner } from '@chakra-ui/react'

import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { useCurrentPosition } from '@/hooks/markets'

import { Container } from '@ds/Container'

import ClosePositionForm from './components/ClosePositionForm'
import ModifyPositionForm from './components/ModifyPositionForm'
import TradeForm from './components/TradeForm'
import WithdrawForm from './components/WithdrawForm'
import { getContainerVariant, useResetFormOnMarketChange } from './hooks'

const dummyData = {
  collateral: '0.000',
  asset: 'ETH',
  amount: '0.000',
  positionSize: '20000',
}

function TradeContainer() {
  const { formState, setTradeFormState } = useTradeFormState()
  const { selectedMarket, orderDirection, setOrderDirection, selectedMarketSnapshot } = useMarketContext()
  const positionData = useCurrentPosition()

  useResetFormOnMarketChange({ setTradeFormState, selectedMarket, formState })

  const handleModifyPosition = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: invalidate positions query
    alert('modify position')
  }

  const handleClosePosition = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: invalidate positions query
    alert('close position')
  }

  const handleWithdrawCollateral = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('withdraw collateral')
  }

  const containerVariant = getContainerVariant(formState)
  const product = selectedMarketSnapshot?.[orderDirection]
  const dataFetched = product && positionData

  return (
    <Container height="100%" minHeight="560px" p="0" variant={containerVariant}>
      {!dataFetched && (
        <Flex height="100%" width="100%" justifyContent="center" alignItems="center">
          <Spinner />
        </Flex>
      )}
      {formState === FormState.trade && dataFetched && (
        <TradeForm
          orderDirection={orderDirection}
          setOrderDirection={setOrderDirection}
          product={product}
          position={positionData.position}
        />
      )}
      {formState === FormState.modify && dataFetched && (
        <ModifyPositionForm
          onSubmit={handleModifyPosition}
          orderDirection={orderDirection}
          setOrderDirection={setOrderDirection}
          amount={dummyData.amount}
        />
      )}
      {formState === FormState.close && dataFetched && (
        <ClosePositionForm onSubmit={handleClosePosition} positionSize={dummyData.positionSize} />
      )}
      {formState === FormState.withdraw && dataFetched && <WithdrawForm onSubmit={handleWithdrawCollateral} />}
    </Container>
  )
}

export default TradeContainer
