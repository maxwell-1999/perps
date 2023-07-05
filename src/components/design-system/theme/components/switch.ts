import { switchAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

import colors from '../colors'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(switchAnatomy.keys)

const tradeForm = definePartsStyle({
  container: {
    width: '22px',
  },
  thumb: {
    height: '10px',
    width: '10px',
  },
  track: {
    height: '10px',
    width: '22px',
    _checked: {
      bg: colors.brand.purple[300],
    },
  },
})

export default defineMultiStyleConfig({ variants: { tradeForm } })
