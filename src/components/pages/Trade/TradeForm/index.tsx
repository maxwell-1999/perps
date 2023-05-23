import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'

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
  const { selectedMarket, orderSide, setOrderSide } = useMarketContext()
  useResetFormOnMarketChange({ setTradeFormState, selectedMarket, formState })

  const handleSubmitTrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('order submitted')
  }

  const handleModifyPosition = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('modify position')
  }

  const handleClosePosition = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('close position')
  }

  const handleWithdrawCollateral = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('withdraw collateral')
  }

  const containerVariant = getContainerVariant(formState)

  return (
    <Container height="100%" minHeight="560px" p="0" variant={containerVariant}>
      {formState === FormState.trade && (
        <TradeForm
          onSubmit={handleSubmitTrade}
          orderSide={orderSide}
          setOrderSide={setOrderSide}
          availableCollateral={dummyData.collateral}
          amount={dummyData.amount}
        />
      )}
      {formState === FormState.modify && (
        <ModifyPositionForm
          onSubmit={handleModifyPosition}
          orderSide={orderSide}
          setOrderSide={setOrderSide}
          availableCollateral={dummyData.collateral}
          amount={dummyData.amount}
        />
      )}
      {formState === FormState.close && (
        <ClosePositionForm onSubmit={handleClosePosition} positionSize={dummyData.positionSize} />
      )}
      {formState === FormState.withdraw && (
        <WithdrawForm onSubmit={handleWithdrawCollateral} collateral={dummyData.collateral} />
      )}
    </Container>
  )
}

export default TradeContainer
