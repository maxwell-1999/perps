import { Flex, Text, Tooltip } from '@chakra-ui/react'

export interface DataRowProps {
  label: string
  value: string | React.ReactNode
  mb?: number | string
  size?: 'sm' | 'md' | 'lg'
  tooltipText?: string
}
export const DataRow: React.FC<DataRowProps> = ({ tooltipText, label, value, mb = 2, size = 'sm', ...props }) => {
  const labelSize = size === 'sm' ? '12px' : size === 'md' ? '13px' : '14px'
  const valueSize = size === 'sm' ? '13px' : size === 'md' ? '14px' : '16px'

  const valueElement =
    typeof value === 'string' ? (
      <Text fontSize={valueSize} cursor={tooltipText && 'pointer'} variant={tooltipText && 'tooltip'}>
        {value}
      </Text>
    ) : (
      value
    )
  return (
    <Flex alignItems="center" justifyContent="space-between" mb={mb} {...props}>
      <Text variant="label" fontSize={labelSize}>
        {label}
      </Text>
      {tooltipText ? (
        <Tooltip label={tooltipText} placement="top" size={size}>
          {valueElement}
        </Tooltip>
      ) : (
        valueElement
      )}
    </Flex>
  )
}
