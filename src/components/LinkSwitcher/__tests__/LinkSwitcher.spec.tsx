import { render, screen } from "@utils/testUtils";
import LinkSwitcher from "../index";

jest.mock("next/dist/client/router", () => ({
  __esModule: true,
  useRouter: () => ({
    query: {},
    pathname: "/",
    asPath: "/",
    events: {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    },
    push: jest.fn(() => Promise.resolve(true)),
    prefetch: jest.fn(() => Promise.resolve(true)),
    replace: jest.fn(() => Promise.resolve(true)),
  }),
}));

describe("LinkSwitcher", () => {
  const testLinks = [
    { href: "/", label: "Home" },
    { href: "/page1", label: "Page 1" },
    { href: "/page2", label: "Page 2" },
  ];

  it("renders without crashing", () => {
    render(<LinkSwitcher links={testLinks} />);
  });

  it("renders the correct number of links", () => {
    render(<LinkSwitcher links={testLinks} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(testLinks.length);
  });

  it("renders the correct link text", () => {
    render(<LinkSwitcher links={testLinks} />);

    testLinks.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
});
