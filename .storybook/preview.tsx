import type { Preview } from "@storybook/react";
import theme from "../src/components/design-system/theme";
import { ChakraProvider, useColorMode, CSSReset } from "@chakra-ui/react";
import { useEffect } from "react";
import React from "react";

interface ColorModeProps {
  colorMode: "light" | "dark";
  children: JSX.Element;
}

function ColorMode(props: ColorModeProps) {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode(props.colorMode);
  }, [props.colorMode]);

  return props.children;
}

export const decorators = [
  (Story, context) => {
    return (
      <ChakraProvider theme={theme}>
        <CSSReset />
        <ColorMode colorMode={context.globals.colorMode}>
          <Story />
        </ColorMode>
      </ChakraProvider>
    );
  },
];

export const globalTypes = {
  colorMode: {
    name: "Color Mode",
    defaultValue: "light",
    toolbar: {
      items: [
        { title: "Light", value: "light" },
        { title: "Dark", value: "dark" },
      ],
      dynamicTitle: true,
    },
  },
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    chakra: {
      theme,
    },
  },
};

export default preview;
