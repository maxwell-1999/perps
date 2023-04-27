import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Input } from "../index";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../../theme";

const testId = "test-input";

describe("Input Component", () => {
  const defaultProps = {
    id: "test-input",
    labelText: "Test Label",
    errorMessage: "",
    helperText: "Test Helper Text",
    isRequired: false,
    pattern: "",
    ["data-testid"]: testId,
  };

  const renderInputComponent = (props = defaultProps) =>
    render(
      <ChakraProvider theme={theme}>
        <Input {...props} />
      </ChakraProvider>,
    );

  it("renders the component without crashing", () => {
    renderInputComponent();
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it("renders the label text correctly", () => {
    renderInputComponent();
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders the helper text correctly", () => {
    renderInputComponent();
    expect(screen.getByText("Test Helper Text")).toBeInTheDocument();
  });

  it("renders the error message when provided", () => {
    const errorMessage = "Test Error Message";
    renderInputComponent({ ...defaultProps, errorMessage });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("sets the input as required when isRequired is true", () => {
    renderInputComponent({ ...defaultProps, isRequired: true });
    expect(screen.getByTestId(testId)).toBeRequired();
  });

  it("sets the pattern attribute when provided", () => {
    const pattern = "\\d+";
    renderInputComponent({ ...defaultProps, pattern });
    expect(screen.getByTestId(testId)).toHaveAttribute("pattern", pattern);
  });

  it("updates the input value on change", () => {
    renderInputComponent();
    fireEvent.change(screen.getByTestId(testId), { target: { value: "New Value" } });
    expect(screen.getByTestId(testId)).toHaveValue("New Value");
  });
});
