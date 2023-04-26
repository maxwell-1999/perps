import { ComponentStyleConfig } from "@chakra-ui/react";
import colors from "../colors";

const Button: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 500,
    borderRadius: "6px",
  },
  sizes: {
    // default size
    md: {
      fontSize: "15px",
      py: "12px",
      px: "15px",
    },
  },
  variants: {
    primary: (props) => ({
      bg: `linear-gradient(0deg, ${colors.brand.blackAlpha[15]}, ${colors.brand.blackAlpha[15]}), ${colors.brand.purple[300]}`,
      color: props.colorMode === "light" ? "white" : "white",
      _hover: {
        bg: `linear-gradient(0deg, ${colors.brand.blackAlpha[20]}, ${colors.brand.blackAlpha[20]}), ${colors.brand.purple[200]}`,
      },
      _disabled: {
        "&:hover": {
          bg: `linear-gradient(0deg, ${colors.brand.blackAlpha[15]}, ${colors.brand.blackAlpha[15]}), ${colors.brand.purple[300]} !important`,
        },
      },
    }),
    secondary: (props) => ({
      bg: `${colors.brand.gray[200]}`,
      border: `1px solid ${colors.brand.gray[150]}`,
      color: props.colorMode === "light" ? "white" : "white",
      _hover: {
        bg: `${colors.brand.gray[150]}`,
      },
      _disabled: {
        "&:hover": {
          bg: `${colors.brand.gray[200]} !important`,
        },
      },
    }),
  },
};

export default Button;
