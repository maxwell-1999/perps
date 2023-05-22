import type { Meta, StoryObj } from '@storybook/react'

import { UserData, columns, data } from './__fixtures__/tableFixture'
import { Table } from './index'

const meta: Meta<typeof Table> = {
  title: 'Design-System/Table',
  component: Table,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Table>

export const Default: Story = () => <Table<UserData> data={data} columns={columns} />
Default.parameters = {
  controls: { hideNoControlsWarning: true },
}
