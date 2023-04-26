import colors from "./colors";

const styles = {
  global: (props: { colorMode: "light" | "dark" }) => ({
    "html, body": {
      bg: props.colorMode === "light" ? colors.background.light : colors.background.dark,
    },
  }),
};

export default styles;
