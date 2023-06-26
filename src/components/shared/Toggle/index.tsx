import { Button, ButtonGroup, Text, useColorModeValue } from '@chakra-ui/react'

import colors from '@/components/design-system/theme/colors'

function hideConnnectedBorder(index: number, side: 'right' | 'left') {
  if (index === 0 && side === 'right') {
    return 'none'
  }
  if (index === 1 && side === 'left') {
    return 'none'
  }
}

interface ToggleProps<T = string> {
  labels: [T, T]
  activeLabel: T
  onChange: (label: T) => void
  overrideValue?: T
  activeColor?: string
}

function Toggle<T extends string>({
  labels,
  activeLabel,
  onChange,
  overrideValue,
  activeColor = colors.brand.green,
}: ToggleProps<T>) {
  const handleToggle = (label: T) => {
    if (label !== activeLabel) {
      onChange(label)
    }
  }

  const inactiveColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])

  return (
    <ButtonGroup isAttached display="flex" flex={1} height="35px">
      {labels.map((label, index) => (
        <Button
          key={label as string}
          width="100%"
          variant={label === activeLabel ? 'toggleActive' : 'toggleInactive'}
          onClick={() => handleToggle(label)}
          borderLeft={hideConnnectedBorder(index, 'left')}
          borderRight={hideConnnectedBorder(index, 'right')}
          // disable the button if the overrideValue prop is present and does not match this label
          isDisabled={overrideValue !== undefined && label !== overrideValue}
        >
          <Text color={label === activeLabel ? activeColor : inactiveColor}>{label}</Text>
        </Button>
      ))}
    </ButtonGroup>
  )
}

export default Toggle
