import { defineStyle, defineStyleConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

import colors from '../colors'

const baseStyle = defineStyle((props) => ({
  borderRadius: '6px',
  bg: '#1c1c28',
  border: `1px solid ${mode(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])(props)}`,
  color: mode('black', 'white')(props),
}))

export default defineStyleConfig({
  baseStyle,
})
