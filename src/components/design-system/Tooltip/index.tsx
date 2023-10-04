import { IconProps, QuestionOutlineIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Box, TextProps as ChakraTextProps, Text, Tooltip, TooltipProps } from '@chakra-ui/react'
import { useState } from 'react'

import colors from '../theme/colors'

export const TooltipText = ({
  tooltipText,
  tooltipProps,
  ...props
}: {
  tooltipText: string | React.ReactNode
  tooltipProps?: Omit<TooltipProps, 'children' | 'isOpen'>
} & ChakraTextProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const _tooltipProps = {
    textDecoration: 'underline dashed',
    textUnderlineOffset: '2px',
    cursor: 'pointer',
    onMouseEnter: () => setIsOpen(true),
    onMouseLeave: () => setIsOpen(false),
    onClick: () => setIsOpen(true),
    ...props,
  }
  return (
    <Tooltip label={tooltipText} placement="top" size="sm" pointerEvents="all" isOpen={isOpen} {...tooltipProps}>
      {typeof props.children === 'string' ? (
        <Text {..._tooltipProps}>{props.children}</Text>
      ) : (
        <Box {..._tooltipProps}>{props.children}</Box>
      )}
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

export const NoticeTooltip = ({
  color,
  tooltipText,
  tooltipProps,
  ...props
}: {
  color?: string
  tooltipText: string | React.ReactNode
  tooltipProps?: Omit<TooltipProps, 'children' | 'isOpen'>
} & IconProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Tooltip label={tooltipText} placement="top" size="sm" pointerEvents="all" isOpen={isOpen} {...tooltipProps}>
      <WarningTwoIcon
        color={color ? color : colors.brand.purple[240]}
        cursor="pointer"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(true)}
        {...props}
      />
    </Tooltip>
  )
}
