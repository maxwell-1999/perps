import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

import colors from '../colors'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys)

const line = definePartsStyle((props) => ({
  tab: {
    fontWeight: '500',
    fontSize: '15px',
    paddingY: '6px',
    color: mode(colors.brand.blackAlpha[54], colors.brand.whiteAlpha[54])(props),
    _selected: {
      borderBottom: `1px solid ${colors.brand.purple[300]}`,
      color: mode('black', 'white')(props),
    },
  },
  tablist: {
    borderBottom: `1px solid`,
    borderColor: 'inherit',
  },
  tabpanel: {
    padding: '0px',
    height: '100%',
    overflow: 'auto',
  },
  tabpanels: { height: '100%', overflow: 'auto' },
  root: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRadius: '6px',
    background: mode(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])(props),
    border: `1px solid ${mode(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])(props)}`,
  },
}))

export default defineMultiStyleConfig({ variants: { line } })
