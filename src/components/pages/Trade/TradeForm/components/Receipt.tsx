import { Flex, FlexProps } from '@chakra-ui/react'

import { DataRow } from '@/components/design-system'

import { useReceiptCopy } from '../hooks'

const receiptData = {
  entryPrice: '0.000',
  exitPrice: '0.000',
  priceImpact: '0.000',
  liquidationPrice: '0.000',
  tradingFee: '0.000',
}

interface ReceiptProps {
  hideEntry?: boolean
}

export function TradeReceipt({ hideEntry, ...props }: ReceiptProps & FlexProps) {
  const copy = useReceiptCopy()
  const { entryPrice, exitPrice, priceImpact, liquidationPrice, tradingFee } = receiptData
  return (
    <Flex flexDirection="column" {...props}>
      {!hideEntry && <DataRow label={copy.entryExit} value={`${entryPrice} / ${exitPrice}`} />}
      <DataRow label={copy.priceImpact} value={priceImpact} />
      <DataRow label={copy.liquidationPrice} value={liquidationPrice} />
      <DataRow label={copy.tradingFee} value={tradingFee} />
    </Flex>
  )
}
