import { StyleFunctionProps, defineStyleConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

import colors from '../colors'

const Text = defineStyleConfig({
  baseStyle: {
    fontWeight: 500,
  },
  variants: {
    label: (props: StyleFunctionProps) => ({
      color: '#7F87A7',
      fontSize: '12px',
    }),
    tooltip: {
      textDecoration: 'underline dashed',
      textUnderlineOffset: '2px',
      cursor: 'pointer',
    },
  },
})

export default Text
