import {
  FormControl,
  FormLabel,
  Input as ChakraInput,
  Flex,
  Box,
  FormErrorMessage,
  FormHelperText,
  FormControlProps,
  InputProps as ChakraInputProps,
  useColorModeValue,
  Text,
  useTheme,
} from "@chakra-ui/react";

export interface InputProps extends ChakraInputProps {
  id: string;
  labelText: string;
  rightLabel?: React.ReactNode;
  width?: FormControlProps["width"];
  errorMessage?: string;
  helperText?: string;
  isRequired?: boolean;
  pattern?: string;
}

export const Input: React.FC<InputProps> = ({
  id,
  labelText,
  rightLabel,
  width,
  errorMessage,
  helperText,
  isRequired,
  pattern,
  ...inputProps
}) => {
  const theme = useTheme();
  const color = useColorModeValue(theme.colors.brand.blackAlpha[50], theme.colors.brand.gray[100]);
  return (
    <FormControl width={width} isInvalid={Boolean(errorMessage)}>
      <Flex justifyContent="space-between" mb={1} p={0} px={1}>
        {labelText && (
          <FormLabel m={0} htmlFor={id}>
            <Text variant="label">{labelText}</Text>
          </FormLabel>
        )}
        {rightLabel && <Box>{rightLabel}</Box>}
      </Flex>
      <ChakraInput
        id={id}
        variant="trade"
        isInvalid={Boolean(errorMessage)}
        isRequired={isRequired}
        pattern={pattern}
        {...inputProps}
      />
      {errorMessage && (
        <FormErrorMessage mt={1} px={1}>
          {errorMessage}
        </FormErrorMessage>
      )}
      {helperText && (
        <FormHelperText mt={1} px={1} color={color}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};
