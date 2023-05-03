import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "./index";
import { UserData, columns, data } from "./__fixtures__/tableFixture";

const meta: Meta<typeof Table> = {
  title: "Design-System/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = () => <Table<UserData> data={data} columns={columns} />;
Default.parameters = {
  controls: { hideNoControlsWarning: true },
};
