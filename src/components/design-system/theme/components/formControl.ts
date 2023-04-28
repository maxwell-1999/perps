import { defineStyleConfig } from "@chakra-ui/react";
import { formAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const formMessageDefaults = {
  fontWeight: 500,
  fontSize: "11px",
};

export const FormError = defineStyleConfig({
  baseStyle: {
    text: formMessageDefaults,
  },
});

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  formAnatomy.keys,
);

const baseStyle = definePartsStyle({
  helperText: formMessageDefaults,
});

export const Form = defineMultiStyleConfig({ baseStyle });
