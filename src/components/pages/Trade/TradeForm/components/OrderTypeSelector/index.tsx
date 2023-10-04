import { Flex, Text, Tooltip } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import colors from '@/components/design-system/theme/colors'

import { Button } from '@ds/Button'

import { OrderTypes, orderTypes } from '../../constants'

interface OrderTypeSelectorProps {
  selectedOrderType: OrderTypes
  onClick: (orderType: OrderTypes) => void
}

export default function OrderTypeSelector({ selectedOrderType, onClick }: OrderTypeSelectorProps) {
  const intl = useIntl()

  const copy = {
    [OrderTypes.market]: intl.formatMessage({ defaultMessage: 'Market' }),
    [OrderTypes.limit]: intl.formatMessage({ defaultMessage: 'Limit' }),
    [OrderTypes.stopLimit]: intl.formatMessage({ defaultMessage: 'Stop Limit' }),
    comingSoon: intl.formatMessage({ defaultMessage: 'Coming Soon' }),
  }

  return (
    <Flex borderBottom={`1px solid ${colors.brand.whiteAlpha[10]}`} px={4} minHeight="30px">
      {orderTypes.map((orderType) => {
        const isSelected = selectedOrderType === orderType
        const isDisabled = orderType !== OrderTypes.market
        return (
          <Tooltip
            label={isDisabled ? copy.comingSoon : null}
            placement="top"
            size="sm"
            pointerEvents="all"
            key={`${orderType}-tooltip`}
            color={colors.brand.whiteAlpha[80]}
          >
            <Button
              px={0}
              py={0}
              mr={4}
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
                    color={isSelected ? 'white' : colors.brand.whiteAlpha[50]}
                    _hover={{ color: isSelected ? 'white' : colors.brand.whiteAlpha[60] }}
                  >
                    {copy[orderType]}
                  </Text>
                </Flex>
              }
            />
          </Tooltip>
        )
      })}
    </Flex>
  )
}
