import { modalAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system'
import { mode } from '@chakra-ui/theme-tools'

import colors from '../colors'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(modalAnatomy.keys)

const baseStyle = definePartsStyle({
  dialog: {
    borderRadius: '9px',
    background: '#1c1c28',
  },
})

const confirmation = definePartsStyle((props) => ({
  dialog: {
    bg: '#232334',
    border: `1px solid ${mode(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])(props)}`,
    width: 'initial',
  },
  body: {
    pt: '26px',
    px: '28px',
  },
}))

export default defineMultiStyleConfig({ baseStyle, variants: { confirmation } })
