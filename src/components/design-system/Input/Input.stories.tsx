import type { Meta, StoryObj } from "@storybook/react";
import { FormLabel, Text } from "@chakra-ui/react";
import colors from "../theme/colors";

import { Input, Pill } from "./index";

const meta: Meta<typeof Input> = {
  title: "Design-System/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    labelText: "Collateral",
    rightLabel: (
      <FormLabel mr={0} mb={0}>
        <Text variant="label">Available: 0.00</Text>
      </FormLabel>
    ),
    rightEl: <Pill text="ETH" color={colors.brand.gray[100]} />,
    width: "50%",
  },
};

export const Error: Story = {
  args: {
    labelText: "Collateral",
    width: "50%",
    errorMessage: "Invalid Value ",
  },
};

export const HelperText: Story = {
  args: {
    labelText: "Collateral",
    width: "50%",
    helperText: "Helper Text",
  },
};
