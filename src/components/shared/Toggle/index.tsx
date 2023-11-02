import { Button, ButtonGroup, Text, useColorModeValue } from '@chakra-ui/react'
import { ReactNode } from 'react'

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
    <div className={'!w-full !p-[1.5px] !rounded-[5px]  relative  flex mx-auto  bg-[#282b39]'}>
      {labels.map((label, index) => (
        <button
          className={
            '!w-full !py-[4px] !text-center !text-f14 !rounded-[5px] text-[#7F87A7]   px-[30px] sm:px-[20px]  pointer z-20 font-bold  ' +
            (label === activeLabel ? 'bg-[#141823] text-1' : '')
          }
          disabled={overrideValue !== undefined && label !== overrideValue}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleToggle(label)
          }}
        >
          <Text color={label === activeLabel ? activeColor : inactiveColor} textTransform="capitalize">
            {label}
          </Text>
        </button>
      ))}
    </div>
  )
}

export default Toggle
export const BuyTradeHeader: React.FC<{ children: ReactNode; primary?: boolean }> = ({ children, primary }) => {
  return <div className={`text-[#7F87A7] text-[15px] mt-[2px] mb-[6px] ${!primary && 'text-[13px]'}`}>{children}</div>
}
