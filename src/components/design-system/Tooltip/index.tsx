import { IconProps, QuestionOutlineIcon } from '@chakra-ui/icons'
import { TextProps as ChakraTextProps, Text, Tooltip, TooltipProps } from '@chakra-ui/react'
import { useState } from 'react'

export const TooltipText = ({
  tooltipText,
  tooltipProps,
  ...props
}: {
  tooltipText: string | React.ReactNode
  tooltipProps?: Omit<TooltipProps, 'children' | 'isOpen'>
} & ChakraTextProps) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Tooltip label={tooltipText} placement="top" size="sm" pointerEvents="all" isOpen={isOpen} {...tooltipProps}>
      <Text
        {...props}
        textDecoration="underline dashed"
        textUnderlineOffset="2px"
        cursor="pointer"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(true)}
      >
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
  tooltipProps?: Omit<TooltipProps, 'children' | 'isOpen'>
} & IconProps) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Tooltip label={tooltipText} placement="top" size="sm" pointerEvents="all" isOpen={isOpen} {...tooltipProps}>
      <QuestionOutlineIcon
        cursor="pointer"
        height="13px"
        width="13px"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(true)}
        {...props}
      />
    </Tooltip>
  )
}
