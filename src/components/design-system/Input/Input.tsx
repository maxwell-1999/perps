import {
  FormControl,
  FormLabel,
  Input as ChakraInput,
  Flex,
  Box,
  BoxProps,
  FormErrorMessage,
  FormHelperText,
  FormControlProps,
  InputRightElement,
  InputProps as ChakraInputProps,
  useColorModeValue,
  Text,
  useTheme,
  InputGroup,
  InputLeftElement,
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
  rightEl?: React.ReactNode;
  leftEl?: React.ReactNode;
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
  rightEl,
  leftEl,
  ...inputProps
}) => {
  const theme = useTheme();
  const color = useColorModeValue(theme.colors.brand.blackAlpha[50], theme.colors.brand.gray[100]);
  const pr = rightEl ? { pr: "60px" } : {};
  const paddingProps = { ...pr };
  return (
    <FormControl width={width} isInvalid={Boolean(errorMessage)}>
      <Flex justifyContent="space-between" mb={2} px={1}>
        {labelText && (
          <FormLabel m={0} htmlFor={id}>
            <Text variant="label">{labelText}</Text>
          </FormLabel>
        )}
        {rightLabel && <Box>{rightLabel}</Box>}
      </Flex>
      <InputGroup variant="trade">
        {leftEl && <InputLeftElement pointerEvents="none">{leftEl}</InputLeftElement>}
        <ChakraInput
          id={id}
          variant="trade"
          isInvalid={Boolean(errorMessage)}
          isRequired={isRequired}
          pattern={pattern}
          {...paddingProps}
          {...inputProps}
        />
        {rightEl && <InputRightElement pointerEvents="none">{rightEl}</InputRightElement>}
      </InputGroup>
      <Flex pt={0} pb={0} px={1}>
        {errorMessage && <FormErrorMessage mt={1}>{errorMessage}</FormErrorMessage>}
        {helperText && (
          <FormHelperText mt={1} color={color}>
            {helperText}
          </FormHelperText>
        )}
      </Flex>
    </FormControl>
  );
};

interface PillProps extends BoxProps {
  text: string;
  borderColor?: string;
  color?: string;
}

export const Pill: React.FC<PillProps> = ({ text, color, borderColor, ...props }) => {
  const theme = useTheme();

  const defaultColor = useColorModeValue(
    theme.colors.brand.blackAlpha[50],
    theme.colors.brand.whiteAlpha[50],
  );
  const textColor = color ? color : defaultColor;

  const defaultBorderColor = useColorModeValue(
    theme.colors.brand.blackAlpha[30],
    theme.colors.brand.whiteAlpha[30],
  );
  const pillBorderColor = borderColor ? borderColor : defaultBorderColor;

  return (
    <Box pr="12px" display="flex" {...props}>
      <Box
        px={2}
        py={1}
        borderRadius="full"
        border="1px solid"
        borderColor={pillBorderColor}
        fontSize="xs"
        lineHeight="1.2"
        fontWeight="bold"
        textTransform="uppercase"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        <Text color={textColor}>{text}</Text>
      </Box>
    </Box>
  );
};
