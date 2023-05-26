import { Divider, Flex, FormLabel, Text } from '@chakra-ui/react'

import Toggle from '@/components/shared/Toggle'
import { OrderDirection } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'

import { Button } from '@ds/Button'
import { Input, Pill } from '@ds/Input'
import { Slider } from '@ds/Slider'

import { formIds, orderDirections } from '../constants'
import { useStyles, useTradeFormCopy } from '../hooks'
import { TradeReceipt } from './Receipt'
import { Form } from './styles'

interface TradeFormProps {
  orderDirection: OrderDirection
  setOrderDirection: (orderDirection: OrderDirection) => void
  availableCollateral: string //bignumberish
  amount: string //bignumberish
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

function TradeForm(props: TradeFormProps) {
  const { orderDirection, setOrderDirection, availableCollateral, amount, onSubmit } = props
  const { textColor, textBtnColor, textBtnHoverColor } = useStyles()
  const { setTradeFormState } = useTradeFormState()
  const { assetMetadata } = useMarketContext()

  const copy = useTradeFormCopy()

  return (
    <Form onSubmit={onSubmit}>
      <Flex flexDirection="column" p="16px">
        <Flex justifyContent="space-between" mb="14px">
          <Text color={textColor}>{copy.trade}</Text>
          <Button
            variant="text"
            label={copy.addCollateral}
            p={0}
            lineHeight={1}
            height="initial"
            fontSize="13px"
            color={textBtnColor}
            _hover={{ color: textBtnHoverColor }}
            onClick={() => setTradeFormState(FormState.close)}
          />
        </Flex>
        <Flex mb="14px">
          <Toggle<OrderDirection> labels={orderDirections} activeLabel={orderDirection} onChange={setOrderDirection} />
        </Flex>
        <Input
          type="number"
          id={formIds.collateral}
          labelText={copy.collateral}
          placeholder="0.0000"
          rightLabel={
            <FormLabel mr={0} mb={0}>
              <Text variant="label">
                {availableCollateral} {copy.max}
              </Text>
            </FormLabel>
          }
          rightEl={<Pill text={assetMetadata.quoteCurrency} />}
          mb="12px"
        />
        <Input
          type="number"
          id={formIds.amount}
          labelText={copy.amount}
          placeholder="0.0000"
          rightLabel={
            <FormLabel mr={0} mb={0}>
              <Text variant="label">
                {amount} {copy.max}
              </Text>
            </FormLabel>
          }
          rightEl={<Pill text={assetMetadata.baseCurrency} />}
          mb="12px"
        />
        {/* Default slider til we get designs */}
        <Slider
          label={copy.leverage}
          ariaLabel="leverage-slider"
          min={0}
          max={20}
          step={0.1}
          onChangeEnd={(value: number) => {
            console.log('leverage', value)
          }}
          containerProps={{
            mb: 2,
          }}
        />
      </Flex>
      <Divider mt="auto" />
      <Flex flexDirection="column" p="16px">
        <TradeReceipt mb="25px" px="3px" />
        <Button type="submit" label={copy.placeTrade} />
      </Flex>
    </Form>
  )
}

export default TradeForm
