import { Flex, FormLabel, Switch, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Control, Validate } from 'react-hook-form'

import { Input, Pill } from '@ds/Input'
import { Slider } from '@ds/Slider'

import { useTradeFormCopy } from '../hooks'

enum InputType {
  Slider = 'slider',
  Input = 'input',
}

interface LeverageInputProps {
  label: string
  labelColor?: string
  min: number
  max: number
  step: number
  control: Control<any>
  name: string
  onChange: (value: string) => void
  validate?: Validate<any, any> | Record<string, Validate<any, any>> | undefined
}

function LeverageInput({ label, min, max, step, control, name, onChange, validate, labelColor }: LeverageInputProps) {
  const [inputType, setInputType] = useState<InputType>(InputType.Slider)

  return (
    <>
      {inputType === InputType.Slider ? (
        <Slider
          label={label}
          labelColor={labelColor}
          rightLabel={<LeverageToggle onClick={setInputType} inputType={inputType} />}
          ariaLabel="leverage-slider"
          min={min}
          max={max}
          step={step}
          control={control}
          name={name}
          onChange={(leverage: number) => onChange(`${leverage}`)}
          validate={validate}
        />
      ) : (
        <Input
          label={label}
          labelColor={labelColor}
          rightLabel={<LeverageToggle onClick={setInputType} inputType={inputType} />}
          placeholder="0.0"
          rightEl={<Pill text="X" />}
          control={control}
          name={name}
          onChange={(e) => onChange(e.target.value)}
          validate={validate}
        />
      )}
    </>
  )
}

const LeverageToggle = ({ onClick, inputType }: { onClick: (type: InputType) => void; inputType: InputType }) => {
  const copy = useTradeFormCopy()
  return (
    <Flex alignItems="center">
      <FormLabel htmlFor="leverage-input" mr={2} mb={0}>
        <Text variant="label">{copy.Slider}</Text>
      </FormLabel>
      <Switch
        variant="tradeForm"
        aria-label={copy.switchLeverageInput}
        isChecked={inputType === InputType.Slider}
        onChange={() => {
          onClick(inputType === InputType.Slider ? InputType.Input : InputType.Slider)
        }}
      />
    </Flex>
  )
}

export default LeverageInput
