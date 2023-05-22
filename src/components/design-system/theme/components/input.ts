import { inputAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react'

import colors from '../colors'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(inputAnatomy.keys)

const baseStyle = definePartsStyle({
  field: {
    borderRadius: '5px',
    fontWeight: 500,
  },
})

const md = defineStyle({
  fontSize: '18px',
  h: '44px',
})

const sizes = {
  md: definePartsStyle({ field: md }),
}

const trade = definePartsStyle({
  field: {
    bg: colors.brand.blackAlpha[5],
    border: `1px solid ${colors.brand.blackAlpha[10]}`,
    _focus: {
      border: `1px solid ${colors.brand.blackAlpha[20]}`,
    },
    _invalid: {
      borderColor: 'red.300',
    },

    _dark: {
      bg: colors.brand.whiteAlpha[5],
      border: `1px solid ${colors.brand.whiteAlpha[10]}`,
      _focus: {
        border: `1px solid ${colors.brand.whiteAlpha[20]}`,
      },
      _invalid: {
        borderColor: 'red.300',
      },
    },
  },
  element: {
    width: 'fit-content',
  },
})

export default defineMultiStyleConfig({ baseStyle, variants: { trade }, sizes })
