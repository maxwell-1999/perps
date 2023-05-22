import colors from './colors'

const styles = {
  global: (props: { colorMode: 'light' | 'dark' }) => ({
    'html, body': {
      bg: props.colorMode === 'light' ? colors.background.light : colors.background.dark,
    },
    '&::-webkit-scrollbar': {
      width: '2px',
      height: '2px',
    },
    '&::-webkit-scrollbar-track': {
      width: '2px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: `${colors.brand.whiteAlpha[20]}`,
      borderRadius: '10px',
    },
  }),
}

export const breakpoints = {
  base: '0em',
  sm: '28em',
  smd: '30em',
  md: '40em',
  lg: '62em',
  xl: '80em',
}

export default styles
