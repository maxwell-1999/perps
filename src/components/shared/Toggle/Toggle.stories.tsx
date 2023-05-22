import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Container } from '../../design-system'
import Toggle from './index'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof Toggle> = {
  title: 'Perennial/Toggle',
  component: Toggle,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Toggle>

const ToggleWrapper = () => {
  const [activeLabel, setActiveLabel] = useState('Long')
  return (
    <Container width="304px" height="500px" p="16px">
      <Toggle
        labels={['Long', 'Short']}
        activeLabel={activeLabel}
        onChange={(label: string) => setActiveLabel(label)}
      />
    </Container>
  )
}

export const Default: Story = () => <ToggleWrapper />

Default.parameters = {
  controls: { hideNoControlsWarning: true },
}
