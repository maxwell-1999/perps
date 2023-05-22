import { Flex, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react'

import { Container } from '../Container'
import { DataRow } from './index'

const meta: Meta<typeof DataRow> = {
  title: 'Design-System/DataRow',
  component: DataRow,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DataRow>

export const Default: Story = () => (
  <Container pt={2} width="304px">
    <DataRow
      label="Entry / Exit"
      value={
        <Flex>
          <Text fontSize="13px">$1,131.12</Text>
          <Text fontSize="13px" color="gray.500">
            / --
          </Text>
        </Flex>
      }
    />
    <DataRow
      label="Price Impact"
      value={
        <Text fontSize="13px" color="gray.500">
          None
        </Text>
      }
    />
    <DataRow label="Liquidation Price" value="$2,504.41" />
    <DataRow label="Trading Fee" value="$2.41" />
  </Container>
)

Default.parameters = {
  controls: { hideNoControlsWarning: true },
}
