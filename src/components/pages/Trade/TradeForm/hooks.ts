import { useColorModeValue, useTheme } from "@chakra-ui/react";

export function useStyles() {
  const { colors } = useTheme();
  const textColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50]);
  const textBtnColor = colors.brand.purple[300];
  const textBtnHoverColor = colors.brand.purple[250];

  return {
    textColor,
    textBtnColor,
    textBtnHoverColor,
  };
}
