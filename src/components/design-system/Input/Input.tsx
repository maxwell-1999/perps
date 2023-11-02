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
import { Property } from 'csstype'
import { Control, Validate, useController } from 'react-hook-form'

import { BuyTradeHeader } from '@/components/shared/Toggle'

export interface InputProps extends ChakraInputProps {
  label?: string | React.ReactNode
  name: string
  control: Control<any>
  rightLabel?: React.ReactNode
  width?: FormControlProps['width']
  helperText?: string
  max?: () => string | null
  isRequired?: boolean
  labelColor?: string
  pattern?: string
  rightEl?: React.ReactNode
  leftEl?: React.ReactNode
  hideFieldError?: boolean
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
  max,
  pattern,
  rightEl,
  validate,
  leftEl,
  labelColor,
  hideFieldError,
  ...inputProps
}) => {
  const pr = rightEl ? { pr: '60px' } : {}
  const paddingProps = { ...pr }

  const {
    field: { ref, ...inputHandlers },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required: isRequired, validate },
  })
  console.log(`Input-inputHandlers: `, inputHandlers)

  return (
    <FormControl width={width} isInvalid={Boolean(error)}>
      {(label || rightLabel) && (
        <Flex justifyContent="space-between" px={1} alignItems="center">
          {typeof label === 'string' ? (
            <FormLabel m={0} htmlFor={id}>
              <BuyTradeHeader>{label}</BuyTradeHeader>
            </FormLabel>
          ) : (
            label
          )}
          {rightLabel && rightLabel}
        </Flex>
      )}
      <InputGroup variant="trade" overflow={'hidden'} mb={0} borderRadius={'md'}>
        {leftEl && <InputLeftElement pointerEvents="none">{leftEl}</InputLeftElement>}
        <ChakraInput
          id={id}
          variant="trade"
          textOverflow="ellipsis"
          isInvalid={Boolean(error)}
          isRequired={isRequired}
          pattern={pattern}
          {...paddingProps}
          {...inputHandlers}
          ref={ref}
          {...inputProps}
          background={'#282B39'}
          className="!bg-[#282B39] !border-none"
        />
        {rightEl && (
          <InputRightElement>
            {max && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  const returnedValue = max()
                  if (returnedValue) inputHandlers.onChange(returnedValue)
                }}
                className="bg-[#141823] rounded-[6px] font-[500] px-3 py-2 text-f12 mr-3  transition-all -hover:translate-y-[2px] active:translate-y-[3px]"
              >
                Max
              </button>
            )}
            {rightEl}
          </InputRightElement>
        )}
      </InputGroup>
      {error && !hideFieldError && <FormErrorMessage pl={1}>{error.message}</FormErrorMessage>}
    </FormControl>
  )
}

interface PillProps extends BoxProps {
  text: string
  borderColor?: string
  color?: string
  texttransform?: Property.TextTransform
}

export const Pill: React.FC<PillProps> = ({ text, color, borderColor, texttransform, ...props }) => {
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
        textTransform={texttransform ?? 'uppercase'}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        <Text color={textColor}>{text}</Text>
      </Box>
    </Box>
  )
}
