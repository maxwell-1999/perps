import { StyleFunctionProps, defineStyleConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

import colors from '../colors'

const Text = defineStyleConfig({
  baseStyle: {
    fontWeight: 500,
  },
  variants: {
    label: (props: StyleFunctionProps) => ({
      color: mode(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])(props),
      fontSize: '12px',
    }),
  },
})

export default Text
