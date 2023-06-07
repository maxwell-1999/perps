/* eslint-disable formatjs/no-literal-string-in-jsx */
import { Box, Flex, FlexProps, Text, useColorModeValue, useSlider } from '@chakra-ui/react'
import React from 'react'
import { Control, useController } from 'react-hook-form'

import colors from '@ds/theme/colors'

export interface Props {
  min: number
  max: number
  step: number
  name: string
  control: Control<any>
  ariaLabel: string
  label: string
  rightLabel?: React.ReactNode
  isDisabled?: boolean
  containerProps?: FlexProps
  onChange?: (value: number) => void
}

export const Slider: React.FC<Props> = ({
  min,
  max,
  step,
  name,
  control,
  ariaLabel,
  label,
  rightLabel,
  containerProps,
  onChange,
  isDisabled,
}) => {
  const { field } = useController({
    name,
    control,
  })

  const { state, getInputProps, getThumbProps, getRootProps, getTrackProps } = useSlider({
    min,
    max,
    step,
    isDisabled,
    ...field,
    onChange,
    focusThumbOnChange: false,
  })

  const inputProps = getInputProps({ value: field.value })
  const textColor = useColorModeValue(colors.brand.blackAlpha[30], colors.brand.whiteAlpha[30])

  return (
    <Flex flexDirection="column" {...containerProps}>
      <Flex justifyContent="space-between" mb={2} px={1}>
        <Text variant="label">{label}</Text>
        {rightLabel}
      </Flex>
      <Flex justifyContent="center">
        <Flex flexDirection="column" width="96%">
          <Flex {...getRootProps()} cursor="pointer" w="100%" aria-label={ariaLabel}>
            <input {...inputProps} hidden />
            <Box
              {...getTrackProps()}
              h="10px"
              bgImage="linear-gradient(to right, rgba(217, 217, 217, 0.3) 3px, transparent 1px)"
              bgSize="10px 100%"
              width="100%"
            />
            <Box
              top="1%"
              boxSize={8}
              bgColor={colors.brand.gray[350]}
              p={2}
              boxShadow="0px 4px 44px rgba(0, 0, 0, 0.2)"
              borderRadius="6px"
              _focusVisible={{
                outline: 'none',
              }}
              {...getThumbProps()}
            >
              <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
                <Text fontSize="14px" fontWeight="bold">{`${state.value.toFixed(1)}x`}</Text>
              </Flex>
            </Box>
          </Flex>
          <Flex justifyContent="space-between">
            <Text size="13px" color={textColor}>{`${min}x`}</Text>
            <Text size="13px" color={textColor}>{`${min + (max - min) / 2}x`}</Text>
            <Text size="13px" color={textColor}>{`${max}x`}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
