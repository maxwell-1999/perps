import React from "react";
import { render, fireEvent, screen } from "@utils/testUtils";
import Toggle from "../index";

describe("Toggle component", () => {
  const labels: [string, string] = ["Option 1", "Option 2"];
  const activeLabel = "Option 1";
  const onChange = jest.fn();

  test("renders toggle with provided labels", () => {
    render(<Toggle labels={labels} activeLabel={activeLabel} onChange={onChange} />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  test("calls onChange when inactive button is clicked", () => {
    render(<Toggle labels={labels} activeLabel={activeLabel} onChange={onChange} />);

    fireEvent.click(screen.getByText("Option 2"));
    expect(onChange).toHaveBeenCalledWith("Option 2");
  });

  test("does not call onChange when active button is clicked", () => {
    render(<Toggle labels={labels} activeLabel={activeLabel} onChange={onChange} />);

    fireEvent.click(screen.getByText("Option 1"));
    expect(onChange).not.toHaveBeenCalledWith("Option 1");
  });
});
