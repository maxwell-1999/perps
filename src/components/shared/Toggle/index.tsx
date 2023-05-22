import { Button, ButtonGroup } from '@chakra-ui/react'

interface ToggleProps<T = string> {
  labels: [T, T]
  activeLabel: T
  onChange: (label: T) => void
}

function hideConnnectedBorder(index: number, side: 'right' | 'left') {
  if (index === 0 && side === 'right') {
    return 'none'
  }
  if (index === 1 && side === 'left') {
    return 'none'
  }
}

function Toggle<T extends string>({ labels, activeLabel, onChange }: ToggleProps<T>) {
  const handleToggle = (label: T) => {
    if (label !== activeLabel) {
      onChange(label)
    }
  }

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
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  )
}

export default Toggle
