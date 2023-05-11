import { defineStyleConfig } from "@chakra-ui/react";
import colors from "../colors";
import { mode } from "@chakra-ui/theme-tools";

const Divider = defineStyleConfig({
  baseStyle: {
    background: mode(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10]),
  },
});

export default Divider;
