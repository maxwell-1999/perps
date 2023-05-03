import { render, screen } from "@utils/testUtils";
import { Table, TableProps } from "../index";
import { UserData, data, columns } from "../__fixtures__/tableFixture";

describe("Table", () => {
  const defaultProps: TableProps<UserData> = {
    data,
    columns,
  };

  it("renders without crashing", () => {
    render(<Table {...defaultProps} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders correct number of rows", () => {
    render(<Table {...defaultProps} />);
    expect(screen.getAllByRole("row")).toHaveLength(data.length + 1); // +1 for the header row
  });

  it("renders the correct headers", () => {
    render(<Table {...defaultProps} />);
    columns.forEach((column) => {
      expect(screen.getByText(column.Header)).toBeInTheDocument();
    });
  });

  it("renders the correct data", () => {
    render(<Table {...defaultProps} />);
    data.forEach((user) => {
      expect(screen.getByText(user.id.toString())).toBeInTheDocument();
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
      expect(screen.getByText(user.role.toUpperCase())).toBeInTheDocument();
    });
  });

  it("correctly renders role in uppercase and bold for each user", () => {
    render(<Table {...defaultProps} />);
    data.forEach((user) => {
      const roleElement = screen.getByText(user.role.toUpperCase());
      expect(roleElement).toBeInTheDocument();
      expect(roleElement.tagName).toBe("STRONG");
    });
  });
});
