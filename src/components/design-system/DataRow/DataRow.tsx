import { Flex, FlexProps, Text, useColorModeValue } from '@chakra-ui/react'

import colors from '../theme/colors'

export interface DataRowProps {
  label: string | React.ReactNode
  value: string | React.ReactNode
  mb?: number | string
  size?: 'sm' | 'md' | 'lg'
  bordered?: boolean
}
export const DataRow: React.FC<DataRowProps & FlexProps> = ({
  label,
  value,
  mb = 2,
  size = 'sm',
  bordered,
  ...props
}) => {
  const labelSize = size === 'sm' ? '12px' : size === 'md' ? '13px' : '14px'
  const valueSize = size === 'sm' ? '13px' : size === 'md' ? '14px' : '16px'
  const borderColor = useColorModeValue(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      mb={bordered ? 1 : mb}
      borderBottom={bordered ? `1px solid ${borderColor}` : 'none'}
      pb={bordered ? 1 : 0}
      {...props}
    >
      {typeof label === 'string' ? (
        <Text variant="label" fontSize={labelSize}>
          {label}
        </Text>
      ) : (
        label
      )}
      {typeof value === 'string' ? <Text fontSize={valueSize}>{value}</Text> : value}
    </Flex>
  )
}

export const TooltipDataRow: React.FC<DataRowProps & FlexProps> = ({ label, value, ...props }) => {
  return (
    <DataRow
      width="100%"
      {...props}
      label={
        <Text variant="label" as="div" mr={2} alignItems="center">
          {label}
        </Text>
      }
      value={
        <Text fontSize="12px" as="div">
          {value}
        </Text>
      }
    />
  )
}
