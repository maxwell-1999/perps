import { ComponentStyleConfig, StyleFunctionProps } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import colors from "../colors";

const Button: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 500,
    borderRadius: "6px",
  },
  sizes: {
    md: {
      fontSize: "15px",
      py: "14px",
      px: "15px",
    },
  },
  variants: {
    primary: (props: StyleFunctionProps) => ({
      bg: `linear-gradient(0deg, ${colors.brand.blackAlpha[15]}, ${colors.brand.blackAlpha[15]}), ${colors.brand.purple[300]}`,
      color: mode("white", "white")(props),
      _hover: {
        bg: `linear-gradient(0deg, ${colors.brand.blackAlpha[20]}, ${colors.brand.blackAlpha[20]}), ${colors.brand.purple[250]}`,
      },
      _disabled: {
        "&:hover": {
          bg: `linear-gradient(0deg, ${colors.brand.blackAlpha[15]}, ${colors.brand.blackAlpha[15]}), ${colors.brand.purple[300]} !important`,
        },
      },
    }),
    secondary: (props: StyleFunctionProps) => ({
      bg: `${colors.brand.gray[200]}`,
      border: `1px solid ${colors.brand.gray[150]}`,
      color: mode("white", "white")(props),
      _hover: {
        bg: `${colors.brand.gray[150]}`,
      },
      _disabled: {
        "&:hover": {
          bg: `${colors.brand.gray[200]} !important`,
        },
      },
    }),
    transparent: (props: StyleFunctionProps) => ({
      bg: mode(colors.brand.blackAlpha[15], colors.brand.whiteAlpha[15])(props),
      border: `1px solid ${mode(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])(props)}`,
      color: mode("black", "white")(props),
      _hover: {
        bg: mode(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])(props),
      },
    }),
    toggleActive: (props: StyleFunctionProps) => ({
      height: "35px",
      // Figure out theme colors later
      bg: mode("black", "black")(props),
      color: mode(colors.brand.green, colors.brand.green)(props),
    }),
    toggleInactive: (props: StyleFunctionProps) => ({
      height: "35px",
      // Figure out theme colors later
      bg: mode(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])(props),
      color: mode(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])(props),
      border: mode(
        `1px solid ${colors.brand.blackAlpha[10]}`,
        `1px solid ${colors.brand.whiteAlpha[10]}`,
      )(props),
    }),
  },
};

export default Button;
