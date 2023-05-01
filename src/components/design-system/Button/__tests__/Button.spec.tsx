import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import { Button, ButtonProps, IconButton } from "../index";
import theme from "../../theme";

const testId = "test-btn";

const renderButton = (props: ButtonProps) => {
  return render(
    <ChakraProvider theme={theme}>
      <Button data-testid={testId} {...props} />
    </ChakraProvider>,
  );
};

describe("Button", () => {
  test("renders button with provided label", () => {
    renderButton({ label: "Test Button", onClick: () => {} });

    const button = screen.getByTestId(testId);
    expect(button).toBeInTheDocument();
  });

  test("displays left and right icons when provided", () => {
    const leftIconTestId = "left-icon";
    const rightIconTestId = "right-icon";

    renderButton({
      label: "Test Button",
      onClick: () => {},
      leftIcon: <span data-testid={leftIconTestId} />,
      rightIcon: <span data-testid={rightIconTestId} />,
    });

    const leftIcon = screen.getByTestId(leftIconTestId);
    const rightIcon = screen.getByTestId(rightIconTestId);

    expect(leftIcon).toBeInTheDocument();
    expect(rightIcon).toBeInTheDocument();
  });

  test("disables the button when isDisabled is true", () => {
    renderButton({ label: "Test Button", onClick: () => {}, isDisabled: true });

    const button = screen.getByTestId(testId);
    expect(button).toBeDisabled();
  });

  test("shows loading spinner when isLoading is true", () => {
    renderButton({ label: "Test Button", onClick: () => {}, isLoading: true });
    const button = screen.getByTestId(testId);
    const spinner = button.querySelector(".chakra-button__spinner");
    expect(spinner).toBeInTheDocument();
  });

  test("renders IconButton", () => {
    const iconTestId = "icon";

    render(
      <ChakraProvider theme={theme}>
        <IconButton
          aria-label="test-icon"
          data-testid={testId}
          icon={<span data-testid={iconTestId} />}
        />
      </ChakraProvider>,
    );

    const icon = screen.getByTestId(iconTestId);
    expect(icon).toBeInTheDocument();
  });
});
