import { progressAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

import colors from '../colors'

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(progressAnatomy.keys)

const baseStyle = definePartsStyle((props) => ({
  filledTrack: {
    bg: mode(colors.brand.green, 'white')(props),
  },
  track: {
    borderRadius: 'full',
  },
}))

export default defineMultiStyleConfig({ baseStyle })
