import { Flex, Text } from '@chakra-ui/react'

export interface DataRowProps {
  label: string
  value: string | React.ReactNode
  mb?: number | string
  size?: 'sm' | 'md'
}
export const DataRow: React.FC<DataRowProps> = ({ label, value, mb = 2, size = 'sm', ...props }) => {
  const labelSize = size === 'sm' ? '12px' : '13px'
  const valueSize = size === 'sm' ? '13px' : '14px'
  return (
    <Flex alignItems="center" justifyContent="space-between" mb={mb} {...props}>
      <Text variant="label" fontSize={labelSize}>
        {label}
      </Text>
      {typeof value === 'string' ? <Text fontSize={valueSize}>{value}</Text> : value}
    </Flex>
  )
}
