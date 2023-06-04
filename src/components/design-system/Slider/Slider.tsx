import {
  Slider as ChakraSlider,
  Flex,
  FlexProps,
  SliderFilledTrack,
  SliderProps,
  SliderThumb,
  SliderTrack,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import { Control, useController } from 'react-hook-form'

export interface Props extends SliderProps {
  ariaLabel: string
  min: number
  max: number
  label: string
  rightLabel?: React.ReactNode
  containerProps?: FlexProps
  name: string
  control: Control<any>
}

export const Slider: React.FC<Props> = ({
  ariaLabel,
  min,
  max,
  label,
  rightLabel,
  containerProps,
  control,
  name,
  ...props
}) => {
  const { field } = useController({
    name,
    control,
  })

  return (
    <Flex flexDirection="column" {...containerProps}>
      <Flex justifyContent="space-between" mb={2} px={1}>
        <Text variant="label">{label}</Text>
        {rightLabel}
      </Flex>
      <ChakraSlider aria-label={ariaLabel} min={min} max={max} {...field} {...props}>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </ChakraSlider>
    </Flex>
  )
}
