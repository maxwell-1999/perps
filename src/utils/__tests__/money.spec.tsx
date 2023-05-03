import { render, screen } from "@testing-library/react";
import { Money } from "../Money";

describe("Money", () => {
  it("renders correctly with a numeric value", () => {
    render(<Money value={1234} />);
    expect(screen.getByText(/1,234.00/)).toBeInTheDocument();
  });

  it("renders correctly with a string value", () => {
    render(<Money value="1234" />);
    expect(screen.getByText(/1,234.00/)).toBeInTheDocument();
  });

  it("returns null for a non-numeric string value", () => {
    const { container } = render(<Money value="abcd" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders correctly with a fiat currency", () => {
    render(<Money value={1234} currency="USD" />);
    expect(screen.getByText(/\$1,234.00/)).toBeInTheDocument();
  });

  it("renders correctly with a crypto currency", () => {
    render(<Money value={1234} currency="BTC" />);
    const btcElement = screen.getByText(/BTC/);
    const moneyElement = btcElement.parentElement;
    expect(moneyElement).toHaveTextContent("1,234.00 BTC");
  });

  it("renders crypto correctly with a large decimal value", () => {
    render(<Money value={0.021231} currency="BTC" />);
    const btcElement = screen.getByText(/BTC/);
    const moneyElement = btcElement.parentElement;
    expect(moneyElement).toHaveTextContent("0.021231 BTC");
  });

  it("defaults to 6 decimal places for large decimal numbers", () => {
    render(<Money value={0.02123121312} currency="BTC" />);
    const btcElement = screen.getByText(/BTC/);
    const moneyElement = btcElement.parentElement;
    expect(moneyElement).toHaveTextContent("0.021231 BTC");
  });

  it("does not render the currency tail if hideTail is set", () => {
    render(<Money value={1234} currency="BTC" hideTail />);
    expect(screen.getByText(/1,234.00/)).toBeInTheDocument();
    expect(screen.queryByText(/BTC/)).not.toBeInTheDocument();
  });
});
