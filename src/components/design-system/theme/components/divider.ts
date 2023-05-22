import { defineStyleConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

import colors from '../colors'

const Divider = defineStyleConfig({
  baseStyle: {
    background: mode(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10]),
  },
})

export default Divider
