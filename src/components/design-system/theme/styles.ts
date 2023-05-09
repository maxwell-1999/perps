import colors from "./colors";

const styles = {
  global: (props: { colorMode: "light" | "dark" }) => ({
    "html, body": {
      bg: props.colorMode === "light" ? colors.background.light : colors.background.dark,
    },
  }),
};

export const breakpoints = {
  base: "0em",
  sm: "40em",
  md: "48em",
  lg: "62em",
  xl: "80em",
};

export default styles;
