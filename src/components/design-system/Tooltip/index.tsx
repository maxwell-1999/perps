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
      <svg
        cursor="pointer"
        height="13px"
        width="13px"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(true)}
      >
        <circle cx={6.901} cy={6.36} r={6} fill="#808191" />
        <path
          d="M6.352 9.595V4.968h1.09v4.627h-1.09ZM6.9 4.311a.636.636 0 0 1-.446-.172.554.554 0 0 1-.186-.418c0-.165.062-.305.186-.42a.63.63 0 0 1 .446-.174c.175 0 .324.058.446.175a.547.547 0 0 1 .187.419.554.554 0 0 1-.187.418.63.63 0 0 1-.446.172Z"
          fill="var(--bg-4)"
        />
      </svg>
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
