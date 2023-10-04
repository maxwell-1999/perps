import { defineStyleConfig } from '@chakra-ui/react'

import colors from '../colors'

const Badge = defineStyleConfig({
  baseStyle: {
    border: 'none',
    borderRadius: '6px',
    px: 2,
    py: 1,
    height: 'fit-content',
    textTransform: 'initial',
    fontWeight: 700,
  },
  variants: {
    purple: {
      bg: colors.brand.purpleAlpha[10],
    },
    green: {
      bg: colors.brand.greenAlpha[10],
    },
    default: {
      bg: colors.brand.whiteAlpha[10],
    },
  },
})

export default Badge
