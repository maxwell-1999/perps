import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "./index";

const meta: Meta<typeof Tabs> = {
  title: "Design-System/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

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
);

Default.parameters = {
  controls: { hideNoControlsWarning: true },
};
