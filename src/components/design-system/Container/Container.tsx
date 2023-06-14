import { Flex, FlexProps, useStyleConfig } from '@chakra-ui/react'

export interface ContainerProps {
  children?: React.ReactNode
  variant?: 'transparent' | 'active' | 'pink' | 'vaultCard'
}

export const Container: React.FC<ContainerProps & FlexProps> = ({ children, variant = 'transparent', ...props }) => {
  const styles = useStyleConfig('Container', { variant })

  return (
    <Flex __css={styles} {...props}>
      {children}
    </Flex>
  )
}
