/* eslint-disable formatjs/no-literal-string-in-jsx */
import { Box, Flex, FlexProps, Text, useColorModeValue, useSlider } from '@chakra-ui/react'
import React from 'react'
import { Control, Validate, useController } from 'react-hook-form'

import { BuyTradeHeader } from '@/components/shared/Toggle'

import colors from '@ds/theme/colors'

import { Button } from '../Button'

export interface Props {
  min: number
  max: number
  step: number
  labelColor?: string
  name: string
  control: Control<any>
  ariaLabel: string
  label: string
  rightLabel?: React.ReactNode
  isDisabled?: boolean
  containerProps?: FlexProps
  onChange?: (value: number) => void
  validate?: Validate<any, any> | Record<string, Validate<any, any>> | undefined
}

export const Slider: React.FC<Props> = ({
  min,
  max,
  step,
  name,
  control,
  ariaLabel,
  label,
  labelColor,
  rightLabel,
  containerProps,
  onChange,
  isDisabled,
  validate,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { validate },
  })

  const { state, actions, getInputProps, getThumbProps, getRootProps, getTrackProps } = useSlider({
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
  const borderColor = useColorModeValue(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])

  const thumbProps = getThumbProps()
  // Hack to center the thumb correctly when the value is not min or max
  if (thumbProps.style?.left && field.value > min && field.value < max) {
    thumbProps.style.left = thumbProps.style.left.toString().replace('18px', '22px')
  }

  return (
    <Flex flexDirection="column" {...containerProps}>
      <Flex justifyContent="space-between" px={1} alignItems="center">
        <BuyTradeHeader>{label}</BuyTradeHeader>
        {rightLabel}
      </Flex>
      <Flex justifyContent="center">
        <Flex flexDirection="column" width="94%">
          <Flex {...getRootProps()} cursor={isDisabled ? 'not-allowed' : 'pointer'} w="100%" aria-label={ariaLabel}>
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
              minWidth="36px"
              boxShadow="0px 4px 44px rgba(0, 0, 0, 0.2)"
              borderRadius="6px"
              _focusVisible={{
                outline: `1px solid ${borderColor}`,
              }}
              {...thumbProps}
            >
              <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
                <Text fontSize="14px" fontWeight="bold">
                  {state.value.toFixed(1)}
                </Text>
              </Flex>
            </Box>
          </Flex>
          <Flex justifyContent="space-between">
            <Button
              variant="text"
              size="13px"
              onClick={() => actions.stepTo(min)}
              color={textColor}
              label={`${formatNumber(min)}x`}
            />
            <Button
              variant="text"
              size="13px"
              onClick={() => actions.stepTo(min + (max - min) / 2)}
              color={textColor}
              label={`${formatNumber(min + (max - min) / 2)}x`}
            />
            <Button
              variant="text"
              size="13px"
              onClick={() => actions.stepTo(max)}
              color={textColor}
              label={`${formatNumber(max)}x`}
            />
          </Flex>
        </Flex>
      </Flex>
      {error && (
        <Text pl={1} fontSize="11px" color="red.300">
          {error.message}
        </Text>
      )}
    </Flex>
  )
}

function formatNumber(num: number): number {
  if (Number.isInteger(num)) {
    return num
  } else {
    return Math.round(num * 10) / 10
  }
}
