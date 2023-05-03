import type { Meta, StoryObj } from "@storybook/react";
import { Flex, Text } from "@chakra-ui/react";

import { DataRow } from "./index";
import { Container } from "../Container";
import { Money } from "../../../utils/Money";

const meta: Meta<typeof DataRow> = {
  title: "Design-System/DataRow",
  component: DataRow,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataRow>;

export const Default: Story = () => (
  <Container pt={2} width="304px">
    <DataRow
      label="Entry / Exit"
      value={
        <Flex>
          <Text fontSize="13px">
            <Money currency="USD" value={"2124.23"} />
          </Text>
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
);

Default.parameters = {
  controls: { hideNoControlsWarning: true },
};
