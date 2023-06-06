import { modalAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system'
import { mode } from '@chakra-ui/theme-tools'

import colors from '../colors'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(modalAnatomy.keys)

const baseStyle = definePartsStyle({
  dialog: {
    borderRadius: '6px',
  },
})

const confirmation = definePartsStyle((props) => ({
  dialog: {
    bg: mode('white', colors.brand.blackSolid[5])(props),
    border: `1px solid ${mode(colors.brand.blackAlpha[30], colors.brand.whiteAlpha[30])(props)}`,
  },
}))

export default defineMultiStyleConfig({ baseStyle, variants: { confirmation } })
