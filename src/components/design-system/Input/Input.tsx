import {
  Box,
  BoxProps,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
  Flex,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Control, Validate, useController } from 'react-hook-form'

export interface InputProps extends ChakraInputProps {
  label: string
  name: string
  control: Control<any>
  rightLabel?: React.ReactNode
  width?: FormControlProps['width']
  helperText?: string
  isRequired?: boolean
  pattern?: string
  rightEl?: React.ReactNode
  leftEl?: React.ReactNode
  displayDecimals?: number
  validate?: Validate<any, any> | Record<string, Validate<any, any>> | undefined
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  name,
  control,
  rightLabel,
  width,
  isRequired,
  pattern,
  rightEl,
  validate,
  displayDecimals,
  leftEl,
  ...inputProps
}) => {
  const pr = rightEl ? { pr: '60px' } : {}
  const paddingProps = { ...pr }
  const [displayValue, setDisplayValue] = useState('')

  const {
    field: { ref, value, onChange, ...inputHandlers },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required: isRequired, validate },
  })

  useEffect(() => {
    if (displayDecimals !== undefined && value !== undefined) {
      const [integerPart, decimalPart] = value.split('.')
      if (decimalPart && decimalPart.length > displayDecimals) {
        setDisplayValue(`${integerPart}.${decimalPart.slice(0, displayDecimals)}`)
      } else {
        setDisplayValue(value)
      }
    } else {
      setDisplayValue(value || '')
    }
  }, [value, displayDecimals])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    if (inputValue.includes('.') && displayDecimals) {
      const [integer, decimal] = inputValue.split('.')
      if (decimal.length > displayDecimals) {
        const formattedDecimals = decimal.slice(0, displayDecimals)
        inputValue = `${integer}.${formattedDecimals}`
      }
      setDisplayValue(inputValue)
    }
    onChange(e)
  }

  return (
    <FormControl width={width} isInvalid={Boolean(error)}>
      <Flex justifyContent="space-between" mb={2} px={1} alignItems="center">
        <FormLabel m={0} htmlFor={id}>
          <Text variant="label">{label}</Text>
        </FormLabel>
        {rightLabel && rightLabel}
      </Flex>
      <InputGroup variant="trade" mb={0}>
        {leftEl && <InputLeftElement pointerEvents="none">{leftEl}</InputLeftElement>}
        <ChakraInput
          id={id}
          variant="trade"
          isInvalid={Boolean(error)}
          isRequired={isRequired}
          pattern={pattern}
          {...paddingProps}
          onChange={handleChange}
          value={displayValue}
          {...inputHandlers}
          ref={ref}
          {...inputProps}
        />
        {rightEl && <InputRightElement pointerEvents="none">{rightEl}</InputRightElement>}
      </InputGroup>
      {error && <FormErrorMessage pl={1}>{error.message}</FormErrorMessage>}
    </FormControl>
  )
}

interface PillProps extends BoxProps {
  text: string
  borderColor?: string
  color?: string
}

export const Pill: React.FC<PillProps> = ({ text, color, borderColor, ...props }) => {
  const theme = useTheme()

  const defaultColor = useColorModeValue(theme.colors.brand.blackAlpha[50], theme.colors.brand.whiteAlpha[50])
  const textColor = color ? color : defaultColor

  const defaultBorderColor = useColorModeValue(theme.colors.brand.blackAlpha[30], theme.colors.brand.whiteAlpha[30])
  const pillBorderColor = borderColor ? borderColor : defaultBorderColor

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
  )
}
