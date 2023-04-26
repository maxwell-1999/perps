import type { Meta, StoryObj } from "@storybook/react";
import { ButtonGroup } from "@chakra-ui/react";
import { Button } from "./index";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof Button> = {
  title: "Perennial/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["primary", "secondary"],
      control: { type: "radio" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    label: "Place trade",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    label: "Cancel",
  },
};

export const Group: Story = () => (
  <ButtonGroup width="300px">
    <Button label="Cancel" variant="secondary" onClick={() => {}} />
    <Button flex={1} label="Add collateral" variant="primary" onClick={() => {}} />
  </ButtonGroup>
);

Group.parameters = {
  controls: { hideNoControlsWarning: true },
};

export const Disabled: Story = () => (
  <ButtonGroup>
    <Button label="Disabled Primary" variant="primary" isDisabled onClick={() => {}} />
    <Button label="Disabled Secondary" variant="secondary" isDisabled onClick={() => {}} />
  </ButtonGroup>
);

Disabled.parameters = {
  controls: { hideNoControlsWarning: true },
};

export const Loading: Story = () => (
  <ButtonGroup>
    <Button label="Loading Primary" variant="primary" isLoading onClick={() => {}} />
    <Button label="Loading Secondary" variant="secondary" isLoading onClick={() => {}} />
  </ButtonGroup>
);

Loading.parameters = {
  controls: { hideNoControlsWarning: true },
};
