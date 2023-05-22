import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react'

import { UserData, columns, data } from '../Table/__fixtures__/tableFixture'
import { Table } from '../Table/index'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from './index'

const meta: Meta<typeof Tabs> = {
  title: 'Design-System/Tabs',
  component: Tabs,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = () => (
  <Tabs>
    <TabList>
      <Tab>This Position</Tab>
      <Tab>All Positions</Tab>
      <Tab>History</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <Box padding={4}>This Position</Box>
      </TabPanel>
      <TabPanel>
        <Box padding={4}>All Positions</Box>
      </TabPanel>
      <TabPanel>
        <Box padding={4}>History</Box>
      </TabPanel>
    </TabPanels>
  </Tabs>
)

Default.parameters = {
  controls: { hideNoControlsWarning: true },
}

export const WithTables: Story = () => (
  <Tabs>
    <TabList>
      <Tab>Table 1</Tab>
      <Tab>Table 2</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <Table<UserData> data={data} columns={columns} />
      </TabPanel>
      <TabPanel>
        <Table<UserData> data={data} columns={columns} />
      </TabPanel>
    </TabPanels>
  </Tabs>
)

WithTables.parameters = {
  controls: { hideNoControlsWarning: true },
}
