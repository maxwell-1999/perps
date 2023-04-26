import colors from "./colors";
import styles from "./styles";
import Button from "./components/button";
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors,
  styles,
  components: {
    Button,
  },
});

export default theme;
