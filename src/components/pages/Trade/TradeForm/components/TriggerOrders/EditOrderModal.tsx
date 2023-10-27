import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react'
import { Address } from 'viem'

import { PositionSide2, SupportedAsset } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'

import { OrderTypes } from '../../constants'
import { TradeFormValues, useTradeFormCopy } from '../../hooks'
import { TriggerOrderForm } from './TriggerOrderForm'

export interface EditOrderModalProps {
  orderType: OrderTypes
  asset: SupportedAsset
  orderDirection: PositionSide2
  onSubmit: (orderData: Partial<TradeFormValues>) => void
  onClose: () => void
  cancelOrderDetails: {
    market: Address
    nonce: bigint
  }
}

const EditOrderModal = ({ orderType, orderDirection, asset, onSubmit, onClose }: EditOrderModalProps) => {
  const copy = useTradeFormCopy()
  const { snapshots2 } = useMarketContext()
  const userMarketSnapshot = snapshots2?.user?.[asset]
  const marketSnapshot = snapshots2?.market?.[asset]

  if (!userMarketSnapshot || !marketSnapshot) {
    return null
  }

  return (
    <Modal isOpen isCentered variant="confirmation" onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxWidth="350px">
        <ModalHeader pb={0}>
          <Text>{copy.editOrder(copy[orderType as OrderTypes.stopLoss | OrderTypes.takeProfit])}</Text>
        </ModalHeader>
        <ModalBody>
          <TriggerOrderForm
            noPadding
            onSubmit={onSubmit}
            userMarketSnapshot={userMarketSnapshot}
            orderDirection={orderDirection as PositionSide2.long | PositionSide2.short}
            selectedOrderType={orderType}
            overrides={{
              selectedMarket: asset,
              selectedMarketSnapshot: marketSnapshot,
            }}
          />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}

export default EditOrderModal
