import {
  Slider as ChakraSlider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderProps,
  Flex,
  Text,
  FlexProps,
} from "@chakra-ui/react";
import React from "react";

export interface Props extends SliderProps {
  ariaLabel: string;
  min: number;
  max: number;
  onChangeEnd?: (value: number) => void;
  label: string;
  rightLabel?: React.ReactNode;
  containerProps?: FlexProps;
}

export const Slider: React.FC<Props> = ({
  ariaLabel,
  min,
  max,
  label,
  rightLabel,
  containerProps,
  ...props
}) => {
  return (
    <Flex flexDirection="column" {...containerProps}>
      <Flex justifyContent="space-between" mb={2} px={1}>
        <Text variant="label">{label}</Text>
        {rightLabel}
      </Flex>
      <ChakraSlider aria-label={ariaLabel} min={min} max={max} {...props}>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </ChakraSlider>
    </Flex>
  );
};
