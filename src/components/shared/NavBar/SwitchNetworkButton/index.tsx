import { HamburgerIcon } from '@chakra-ui/icons'
import { Popover, PopoverBody, PopoverContent, PopoverHeader, PopoverTrigger, useDisclosure } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'

import { IconButton } from '@/components/design-system'
import { mainnetChains } from '@/constants/network'
import { useDefaultChain } from '@/contexts/chainContext'

import { Button } from '@ds/Button'

import { useNavCopy } from '../hooks'

export default function SwitchNetworkButton() {
  const { setDefaultChain, defaultChain } = useDefaultChain()
  const { isOpen, onOpen, onClose } = useDisclosure({ id: 'networkSelector' })
  const copy = useNavCopy()

  return (
    <Popover placement="bottom-start" variant="assetSelector" isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <PopoverTrigger>
        <IconButton icon={<HamburgerIcon />} variant="ghost" size="sm" aria-label={copy.switchNetwork} />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>{copy.switchNetwork}</PopoverHeader>
        <PopoverBody>
          {mainnetChains.map((option) => {
            const isActive = option.id === defaultChain.id
            return (
              <Button
                variant="text"
                key={option.id}
                onClick={() => {
                  setDefaultChain(option)
                  onClose()
                }}
                isDisabled={isActive}
                size="sm"
                width="full"
                label={<Text>{option.name}</Text>}
              />
            )
          })}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
