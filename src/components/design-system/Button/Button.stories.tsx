import { ButtonGroup, Flex } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react'

import RedX from '../../../../public/icons/red-x.svg'
import Settings from '../../../../public/icons/settings.svg'
import { Button, IconButton } from './index'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof Button> = {
  title: 'Design-System/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['primary', 'secondary', 'ghost', 'transparent'],
      control: { type: 'radio' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Place trade',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Cancel',
  },
}

export const Transparent: Story = {
  args: {
    variant: 'transparent',
    label: 'Cancel',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    label: 'Learn more',
  },
}

export const Text: Story = {
  args: {
    variant: 'text',
    label: 'Learn more',
  },
}

export const IconButtons: Story = () => (
  <Flex>
    <IconButton aria-label="settings" icon={<Settings />} mr={1} />
    <IconButton aria-label="close" icon={<RedX />} />
  </Flex>
)

IconButtons.parameters = {
  controls: { hideNoControlsWarning: true },
}

export const Group: Story = () => (
  <ButtonGroup width="300px">
    <Button label="Cancel" variant="transparent" onClick={() => {}} />
    <Button flex={1} label="Add collateral" variant="primary" onClick={() => {}} />
  </ButtonGroup>
)

Group.parameters = {
  controls: { hideNoControlsWarning: true },
}

export const Disabled: Story = () => (
  <ButtonGroup>
    <Button label="Disabled Primary" variant="primary" isDisabled onClick={() => {}} />
    <Button label="Disabled Secondary" variant="secondary" isDisabled onClick={() => {}} />
  </ButtonGroup>
)

Disabled.parameters = {
  controls: { hideNoControlsWarning: true },
}

export const Loading: Story = () => (
  <ButtonGroup>
    <Button label="Loading Primary" variant="primary" isLoading onClick={() => {}} />
    <Button label="Loading Secondary" variant="secondary" isLoading onClick={() => {}} />
  </ButtonGroup>
)

Loading.parameters = {
  controls: { hideNoControlsWarning: true },
}
