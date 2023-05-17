import { popoverAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import colors from "../colors";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  popoverAnatomy.keys,
);

const assetSelector = definePartsStyle((props) => ({
  content: {
    borderRadius: "6px",
    background: mode(colors.brand.gray[300], colors.brand.gray[300])(props),
    border: `1px solid ${mode(colors.brand.blackAlpha[30], colors.brand.whiteAlpha[30])(props)}`,
    width: "304px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    paddingTop: "21px",
    paddingBottom: "8px",
    px: "21px",
    borderBottom: `1px solid ${mode(
      colors.brand.blackAlpha[10],
      colors.brand.whiteAlpha[10],
    )(props)}`,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    padding: 0,
  },

  closeButton: {
    color: colors.brand.whiteAlpha[50],
    position: "initial",
    height: "22px",
    width: "22px",
  },
}));

export default defineMultiStyleConfig({ variants: { assetSelector } });
