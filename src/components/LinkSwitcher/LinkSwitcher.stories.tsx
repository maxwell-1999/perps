import type { Meta, StoryObj } from "@storybook/react";
import LinkSwitcher from "./index";

const meta: Meta<typeof LinkSwitcher> = {
  title: "Perennial/LinkSwitcher",
  component: LinkSwitcher,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LinkSwitcher>;

export const Default: Story = {
  args: {
    links: [
      { href: "/Trade", label: "Trade" },
      { href: "/Earn", label: "Earn" },
      { href: "/Documentation", label: "Documentation" },
    ],
  },
};

Default.parameters = {
  nextRouter: {
    path: "/Trade",
  },
};
