import { Flex, Spinner } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { useCurrentPosition } from '@/hooks/markets'

import { Container } from '@ds/Container'

import ClosePositionForm from './components/ClosePositionForm'
import TradeForm from './components/TradeForm'
import WithdrawForm from './components/WithdrawForm'
import { useResetFormOnMarketChange } from './hooks'

function TradeContainer() {
  const { formState, setTradeFormState } = useTradeFormState()
  const { selectedMarket, orderDirection, setOrderDirection, selectedMarketSnapshot } = useMarketContext()
  const positionData = useCurrentPosition()
  const { address } = useAccount()

  useResetFormOnMarketChange({ setTradeFormState, selectedMarket, formState })

  const handleWithdrawCollateral = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('withdraw collateral')
  }

  const product = selectedMarketSnapshot?.[orderDirection]
  const positionDataLoaded = positionData && 'position' in positionData
  const positionPresent = positionDataLoaded && positionData.position !== undefined
  const positionOrderDirection = positionData?.position?.direction
  useEffect(() => {
    if (positionOrderDirection !== undefined && positionOrderDirection !== orderDirection) {
      setOrderDirection(positionOrderDirection)
    }
  })

  const containerVariant =
    formState !== FormState.close && positionDataLoaded && positionPresent && address ? 'pink' : 'transparent'

  if (!product || (address && !positionDataLoaded)) {
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
          position={positionPresent ? positionData.position : undefined}
        />
      )}
      {formState === FormState.close && positionPresent && positionData.position !== undefined && (
        <ClosePositionForm asset={selectedMarket} position={positionData.position} product={product} />
      )}
      {formState === FormState.withdraw && <WithdrawForm onSubmit={handleWithdrawCollateral} />}
    </Container>
  )
}

export default TradeContainer
