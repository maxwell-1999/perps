import { CSSReset, ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import { JSXElementConstructor, ReactElement, ReactNode } from 'react'
import { IntlProvider } from 'react-intl'

import theme from '@ds/theme'

const AllTheProviders = ({ children }: { children?: ReactNode }) => {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={{}}>
      <ChakraProvider theme={theme}>
        <CSSReset />
        {children}
      </ChakraProvider>
    </IntlProvider>
  )
}

const customRender = (ui: ReactElement<any, string | JSXElementConstructor<any>>, options?: any) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
