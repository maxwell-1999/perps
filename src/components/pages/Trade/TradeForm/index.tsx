import { Flex, Spinner } from '@chakra-ui/react'

import { SupportedAsset } from '@/constants/markets'
import { PositionSide2 } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { useAddress } from '@/hooks/network'
import { closedOrResolved } from '@/utils/positionUtils'

import ClosePositionForm from './components/ClosePositionForm'
import TradeForm from './components/TradeForm'
import WithdrawCollateralForm from './components/WithdrawCollateralForm'
import { FormContainer } from './components/styles'
import { useResetFormOnMarketChange, useSocializationAlert } from './hooks'
import { getContainerVariant } from './utils'

function TradeContainer({ isMobile }: { isMobile?: boolean }) {
  const { formState, setTradeFormState } = useTradeFormState()
  const {
    selectedMarket,
    orderDirection,
    setOrderDirection,
    selectedMakerMarket,
    isMaker,
    snapshots2,
    userCurrentPosition,
  } = useMarketContext()
  const { address } = useAddress()

  useResetFormOnMarketChange({ setTradeFormState, formState })
  useSocializationAlert()

  const market = snapshots2?.market?.[isMaker ? selectedMakerMarket : selectedMarket]

  const isRestricted = isMaker
    ? userCurrentPosition?.side === PositionSide2.long || userCurrentPosition?.side === PositionSide2.short
    : userCurrentPosition?.side === PositionSide2.maker

  const containerVariant = getContainerVariant(formState, !!closedOrResolved(userCurrentPosition?.status), !address)
  if (!market) {
    return (
      <FormContainer variant={containerVariant}>
        <Flex height="100%" width="100%" justifyContent="center" alignItems="center">
          <Spinner />
        </Flex>
      </FormContainer>
    )
  }

  return (
    <FormContainer variant={containerVariant} isMobile={isMobile}>
      {[FormState.trade, FormState.modify].includes(formState) && (
        <TradeForm
          asset={isMaker ? (selectedMakerMarket as SupportedAsset) : selectedMarket}
          orderSide={isMaker ? PositionSide2.maker : orderDirection}
          setOrderDirection={setOrderDirection}
          market={market}
          position={userCurrentPosition}
          isRestricted={isRestricted}
        />
      )}
      {formState === FormState.close && userCurrentPosition && (
        <ClosePositionForm
          asset={isMaker ? selectedMakerMarket : selectedMarket}
          position={userCurrentPosition}
          product={market}
        />
      )}
      {formState === FormState.withdraw && userCurrentPosition && (
        <WithdrawCollateralForm
          asset={isMaker ? selectedMakerMarket : selectedMarket}
          position={userCurrentPosition}
          product={market}
        />
      )}
    </FormContainer>
  )
}

export default TradeContainer
