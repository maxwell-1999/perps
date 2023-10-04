import { Badge as ChakraBadge, Text } from '@chakra-ui/react'

import colors from '@/components/design-system/theme/colors'

type BadgeVariant = 'purple' | 'green' | 'default'

function getTextColor(variant: BadgeVariant) {
  switch (variant) {
    case 'purple':
      return colors.brand.purple[240]
    case 'green':
      return colors.brand.green
    default:
      return 'white'
  }
}
export const Badge = ({
  children,
  variant = 'default',
  text,
}: {
  text?: string
  children?: React.ReactNode
  variant?: BadgeVariant
}) => {
  const textColor = getTextColor(variant)

  return (
    <ChakraBadge variant={variant}>
      {text ? (
        <Text color={textColor} fontWeight={600}>
          {text}
        </Text>
      ) : (
        children
      )}
    </ChakraBadge>
  )
}
