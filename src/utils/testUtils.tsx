import { render } from "@testing-library/react";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { JSXElementConstructor, ReactElement, ReactNode } from "react";
import theme from "@ds/theme";

const AllTheProviders = ({ children }: { children?: ReactNode }) => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      {children}
    </ChakraProvider>
  );
};

const customRender = (ui: ReactElement<any, string | JSXElementConstructor<any>>, options?: any) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
