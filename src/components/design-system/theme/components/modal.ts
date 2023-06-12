import { modalAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system'
import { mode } from '@chakra-ui/theme-tools'

import colors from '../colors'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(modalAnatomy.keys)

const baseStyle = definePartsStyle({
  dialog: {
    borderRadius: '9px',
    width: 'initial',
  },
})

const confirmation = definePartsStyle((props) => ({
  dialog: {
    bg: mode('white', colors.brand.blackSolid[10])(props),
    border: `1px solid ${mode(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])(props)}`,
  },
  body: {
    pt: '26px',
    px: '28px',
  },
}))

export default defineMultiStyleConfig({ baseStyle, variants: { confirmation } })
