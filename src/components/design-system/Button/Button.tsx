import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import { JSXElementConstructor, ReactElement } from "react";

export interface ButtonProps {
  onClick: () => void;
  label: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "transparent";
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactElement<any, string | JSXElementConstructor<any>>;
  rightIcon?: ReactElement<any, string | JSXElementConstructor<any>>;
  size?: "xs" | "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps & ChakraButtonProps> = ({
  label,
  variant = "primary",
  ...props
}) => {
  return (
    <ChakraButton variant={variant} {...props}>
      {label}
    </ChakraButton>
  );
};
