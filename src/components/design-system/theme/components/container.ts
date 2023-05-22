import { StyleFunctionProps, defineStyleConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

import colors from '../colors'

const Container = defineStyleConfig({
  baseStyle: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '6px',
    boxSizing: 'border-box',
    maxWidth: '100%',
    px: '7px',
    py: '7px',
  },
  variants: {
    transparent: (props: StyleFunctionProps) => ({
      bg: mode(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])(props),
      border: `1px solid ${mode(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])(props)}`,
    }),
    active: (props: StyleFunctionProps) => ({
      bg: mode(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])(props),
      border: `1px solid ${mode(colors.brand.blackAlpha[30], colors.brand.whiteAlpha[30])(props)}`,
      boxShadow: `0px 4px 34px ${mode(colors.brand.blackAlpha[15], colors.brand.whiteAlpha[15])(props)}`,
      backdropFilter: 'blur(107px)',
    }),
    pink: (props: StyleFunctionProps) => ({
      bg: mode(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])(props),
      border: `1px solid ${colors.brand.purple.alpha}`,
    }),
  },
  defaultProps: {
    variant: 'transparent',
  },
})

export default Container
