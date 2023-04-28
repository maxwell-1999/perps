import type { Meta, StoryObj } from "@storybook/react";

import { Container } from "./index";

const meta: Meta<typeof Container> = {
  title: "Design-System/Container",
  component: Container,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["transparent", "active"],
      control: { type: "radio" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Transparent: Story = {
  args: {
    height: "200px",
    width: "150px",
    alignItems: "center",
    justifyContent: "center",
    children: "Hello world",
  },
};

export const Active: Story = {
  args: {
    height: "200px",
    width: "150px",
    alignItems: "center",
    justifyContent: "center",
    children: "Hello world",
    variant: "active",
  },
};
