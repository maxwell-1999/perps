import { Popover, PopoverBody, PopoverContent, PopoverHeader, PopoverTrigger, useDisclosure } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import Image from 'next/image'

import { IconButton } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import { mainnetChains, networkToIcon } from '@/constants/network'
import { useDefaultChain } from '@/contexts/chainContext'

import { Button } from '@ds/Button'

import { useNavCopy } from '../hooks'

export default function SwitchNetworkButton() {
  const { setDefaultChain, defaultChain } = useDefaultChain()
  const { isOpen, onOpen, onClose } = useDisclosure({ id: 'networkSelector' })
  const copy = useNavCopy()

  const icon = networkToIcon[defaultChain.id]

  return (
    <Popover placement="bottom-start" variant="assetSelector" isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <PopoverTrigger>
        <IconButton
          icon={<Image src={icon} alt={defaultChain.name} height={26} width={26} />}
          variant="transparent"
          aria-label={copy.switchNetwork}
        />
      </PopoverTrigger>
      <PopoverContent width="200px">
        <PopoverHeader bg={colors.brand.blackAlpha[60]} borderTopLeftRadius="6px" borderTopRightRadius="6px">
          {copy.switchNetwork}
        </PopoverHeader>
        <PopoverBody bg={colors.brand.blackAlpha[60]} borderBottomLeftRadius="6px" borderBottomRightRadius="6px">
          {mainnetChains.map((option, index) => {
            const isActive = option.id === defaultChain.id
            const icon = networkToIcon[option.id]

            return (
              <Button
                variant="ghost"
                key={option.id}
                borderBottom={index !== mainnetChains.length - 1 ? `1px solid ${colors.brand.whiteAlpha[10]}` : 'none'}
                onClick={() => {
                  setDefaultChain(option)
                  onClose()
                }}
                isDisabled={isActive}
                leftIcon={<Image src={icon} alt={option.name} height={12} width={12} />}
                label={<Text color="white">{option.name}</Text>}
              />
            )
          })}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
