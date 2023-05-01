import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
  IconButton as ChakraIconButton,
  IconButtonProps as ChakraIconButtonProps,
} from "@chakra-ui/react";
import { JSXElementConstructor, ReactElement } from "react";

export interface ButtonProps extends ChakraButtonProps {
  label: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "transparent";
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactElement<any, string | JSXElementConstructor<any>>;
  rightIcon?: ReactElement<any, string | JSXElementConstructor<any>>;
}

export const Button: React.FC<ButtonProps> = ({ label, variant = "primary", ...props }) => {
  return (
    <ChakraButton variant={variant} {...props}>
      {label}
    </ChakraButton>
  );
};

export interface IconButtonProps extends ChakraIconButtonProps {
  icon: ReactElement<any, string | JSXElementConstructor<any>>;
}

export const IconButton: React.FC<IconButtonProps> = ({ ...props }) => {
  return <ChakraIconButton variant="transparent" {...props} />;
};
