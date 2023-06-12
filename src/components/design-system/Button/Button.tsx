import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
  IconButton as ChakraIconButton,
  IconButtonProps as ChakraIconButtonProps,
} from '@chakra-ui/react'
import { JSXElementConstructor, ReactElement, forwardRef } from 'react'

export interface ButtonProps extends ChakraButtonProps {
  label: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'transparent' | 'text' | 'pairSelector' | 'pairDropdown' | 'outline'
  isDisabled?: boolean
  isLoading?: boolean
  leftIcon?: ReactElement<any, string | JSXElementConstructor<any>>
  rightIcon?: ReactElement<any, string | JSXElementConstructor<any>>
  ref?: React.Ref<any>
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ label, variant = 'primary', ...props }, ref) => {
  return (
    <ChakraButton ref={ref} variant={variant} {...props}>
      {label}
    </ChakraButton>
  )
})

Button.displayName = 'Button'

export interface IconButtonProps extends ChakraIconButtonProps {
  icon: ReactElement<any, string | JSXElementConstructor<any>>
}

export const IconButton: React.FC<IconButtonProps> = ({ ...props }) => {
  return <ChakraIconButton variant="transparent" {...props} />
}

export { ButtonGroup } from '@chakra-ui/react'
