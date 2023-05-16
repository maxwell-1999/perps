import colors from "./colors";
import styles, { breakpoints } from "./styles";
import Button from "./components/button";
import Input from "./components/input";
import Text from "./components/text";
import Tabs from "./components/tabs";
import Divider from "./components/divider";
import Container from "./components/container";
import Popover from "./components/popover";
import { FormError, Form } from "./components/formControl";
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { Hanken_Grotesk } from "next/font/google";

const hankenGrotesk = Hanken_Grotesk({ subsets: ["latin"] });

const fonts = {
  heading: `${hankenGrotesk.style.fontFamily}, sans-serif`,
  body: `${hankenGrotesk.style.fontFamily}, sans-serif`,
};

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  fonts,
  config,
  colors,
  styles,
  breakpoints,
  components: {
    Button,
    Container,
    Input,
    Text,
    FormError,
    Form,
    Tabs,
    Divider,
    Popover,
  },
});

export default theme;
