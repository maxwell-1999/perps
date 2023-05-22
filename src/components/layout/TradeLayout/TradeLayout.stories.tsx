import { useBreakpointValue } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react'

import { Container } from '../../design-system/Container'
import {
  ChartGridItem,
  HeaderGridItem,
  MarketBarGridItem,
  PositionManagerGridItem,
  TradeFormGridItem,
  TradeLayout,
} from './index'

const meta: Meta<typeof TradeLayout> = {
  title: 'Perennial/TradeLayout',
  component: TradeLayout,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TradeLayout>

export const Default: Story = () => {
  const isBase = useBreakpointValue({ base: true, md: false })
  // Offset layout height to account for the storybook header
  return (
    <TradeLayout>
      <HeaderGridItem>
        <Container height="100%">Header</Container>
      </HeaderGridItem>
      <TradeFormGridItem>
        <Container height="100%">Trade Form</Container>
      </TradeFormGridItem>
      {!isBase && (
        <>
          <MarketBarGridItem>
            <Container height="100%">Market Bar</Container>
          </MarketBarGridItem>
          <ChartGridItem>
            <Container height="100%">Chart</Container>
          </ChartGridItem>
          <PositionManagerGridItem>
            <Container height="100%">Position Manager</Container>
          </PositionManagerGridItem>
        </>
      )}
    </TradeLayout>
  )
}

Default.parameters = {
  nextRouter: {
    path: '/Trade',
  },
}
