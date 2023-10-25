import { Flex, Text } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import colors from '@/components/design-system/theme/colors'
import { useMarketContext } from '@/contexts/marketContext'

import { Button } from '@ds/Button'

import { OrderTypes, orderTypes } from '../../constants'

interface OrderTypeSelectorProps {
  selectedOrderType: OrderTypes
  onClick: (orderType: OrderTypes) => void
  hasPosition: boolean
  isRestricted: boolean
}

export default function OrderTypeSelector({
  selectedOrderType,
  onClick,
  hasPosition,
  isRestricted,
}: OrderTypeSelectorProps) {
  const intl = useIntl()
  const { isMaker } = useMarketContext()

  const copy = {
    [OrderTypes.market]: intl.formatMessage({ defaultMessage: 'Market' }),
    [OrderTypes.limit]: intl.formatMessage({ defaultMessage: 'Limit' }),
    [OrderTypes.stopLoss]: intl.formatMessage({ defaultMessage: 'Stop Loss' }),
    [OrderTypes.takeProfit]: intl.formatMessage({ defaultMessage: 'Take Profit' }),
    triggerOrderDisabled: intl.formatMessage({
      defaultMessage: 'An open position is required to set a trigger order.',
    }),
  }

  return (
    <Flex borderBottom={`1px solid ${colors.brand.whiteAlpha[10]}`} px={4} alignItems="center" minHeight="30px">
      {orderTypes.map((orderType, index) => {
        const isSelected = selectedOrderType === orderType
        const isDisabled = isTabDisabled(orderType, hasPosition, isMaker, isRestricted)
        if (isDisabled) return null
        return (
          <Button
            px={0}
            py={0}
            mr={index !== orderTypes.length - 1 ? 4 : 0}
            height="100%"
            borderRadius={0}
            key={orderType}
            isDisabled={isDisabled}
            variant={'text'}
            onClick={() => onClick(orderType)}
            label={
              <Flex
                height="100%"
                style={isSelected ? { boxShadow: `0 -1px 0 0 ${colors.brand.purple[240]} inset` } : {}}
              >
                <Text
                  height="100%"
                  fontSize={{ base: '14px', lg: '15px' }}
                  color={isSelected ? 'white' : colors.brand.whiteAlpha[50]}
                  _hover={{ color: isSelected ? 'white' : colors.brand.whiteAlpha[60] }}
                >
                  {copy[orderType]}
                </Text>
              </Flex>
            }
          />
        )
      })}
    </Flex>
  )
}

const isTabDisabled = (orderType: OrderTypes, hasPosition: boolean, isMaker: boolean, isRestricted: boolean) => {
  const isTrigger = orderType === OrderTypes.stopLoss || orderType === OrderTypes.takeProfit
  if (
    (isMaker && isTrigger) ||
    (isMaker && orderType === OrderTypes.limit) ||
    (!hasPosition && isTrigger) ||
    (isRestricted && isTrigger)
  ) {
    return true
  }
}
