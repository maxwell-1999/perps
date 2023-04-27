import { StyleFunctionProps, defineStyleConfig } from "@chakra-ui/react";
import colors from "../colors";
import { mode } from "@chakra-ui/theme-tools";

const Text = defineStyleConfig({
  baseStyle: {
    fontWeight: 500,
  },
  variants: {
    label: (props: StyleFunctionProps) => ({
      color: mode(colors.brand.blackAlpha[50], colors.brand.gray[100])(props),
      fontSize: "12px",
    }),
  },
});

export default Text;
