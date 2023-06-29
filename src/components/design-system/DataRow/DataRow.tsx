import { Flex, Text } from '@chakra-ui/react'

export interface DataRowProps {
  label: string | React.ReactNode
  value: string | React.ReactNode
  mb?: number | string
  size?: 'sm' | 'md' | 'lg'
}
export const DataRow: React.FC<DataRowProps> = ({ label, value, mb = 2, size = 'sm', ...props }) => {
  const labelSize = size === 'sm' ? '12px' : size === 'md' ? '13px' : '14px'
  const valueSize = size === 'sm' ? '13px' : size === 'md' ? '14px' : '16px'
  return (
    <Flex alignItems="center" justifyContent="space-between" mb={mb} {...props}>
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
