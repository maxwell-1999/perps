import { IconProps, QuestionOutlineIcon } from '@chakra-ui/icons'
import { TextProps as ChakraTextProps, Text, Tooltip, TooltipProps } from '@chakra-ui/react'

export const TooltipText = ({
  tooltipText,
  tooltipProps,
  ...props
}: {
  tooltipText: string | React.ReactNode
  tooltipProps?: Omit<TooltipProps, 'children'>
} & ChakraTextProps) => {
  return (
    <Tooltip label={tooltipText} placement="top" size="sm" pointerEvents="all" {...tooltipProps}>
      <Text {...props} textDecoration="underline dashed" textUnderlineOffset="2px" cursor="pointer">
        {props.children}
      </Text>
    </Tooltip>
  )
}

export const TooltipIcon = ({
  tooltipText,
  tooltipProps,
  ...props
}: {
  tooltipText: string | React.ReactNode
  tooltipProps?: Omit<TooltipProps, 'children'>
} & IconProps) => {
  return (
    <Tooltip label={tooltipText} placement="top" size="sm" pointerEvents="all" {...tooltipProps}>
      <QuestionOutlineIcon cursor="pointer" height="13px" width="13px" {...props} />
    </Tooltip>
  )
}
