import { HamburgerIcon } from '@chakra-ui/icons'
import { Box, Flex, Stack, Text, useColorModeValue, useDisclosure, useTheme } from '@chakra-ui/react'
import Logo from '@public/logoTransparent.svg'
import Link from 'next/link'

import { HiddenOnDesktop, HiddenOnMobile } from '@/components/shared/responsive'
import { useAddress } from '@/hooks/network'

import { Button, ButtonGroup, IconButton } from '@ds/Button'
import { MobileDrawer } from '@ds/MobileDrawer'

import ConnectWalletButton from './ConnectWalletButton'
import LinkSwitcher from './LinkSwitcher'
import SwitchNetworkButton from './SwitchNetworkButton'
import { links } from './constants'
import { useNavCopy } from './hooks'
import { MobileButtonLabel, Nav, V1Link } from './styles'

function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const theme = useTheme()
  const linkUnderlineColor = useColorModeValue(theme.colors.brand.blackAlpha[10], theme.colors.brand.whiteAlpha[10])
  const { address, overriding } = useAddress()
  const copy = useNavCopy()

  return (
    <Nav className="bg-[#232334] py-[4px] px-2 pr-3 pb-[1px] ">
      <Flex>
        <HiddenOnMobile>
          <LinkSwitcher links={links} />
          <V1Link />
        </HiddenOnMobile>
        <HiddenOnDesktop>
          <IconButton aria-label={copy.menu} icon={<HamburgerIcon height="20px" width="20px" />} onClick={onOpen} />
          <MobileDrawer
            isOpen={isOpen}
            placement="left"
            onClose={onClose}
            header={
              <Flex alignItems="center">
                <Box mr={3}>
                  <Logo />
                </Box>
                <Text>{copy.perennial}</Text>
              </Flex>
            }
          >
            <Stack>
              {links.map((link) => (
                <Link href={link.href} key={link.href} passHref target={link.external ? '_blank' : ''}>
                  <Button label={<MobileButtonLabel label={link.label} />} variant="text" width="100%" />
                  <Box height="1px" width="100%" bg={linkUnderlineColor} mt={2} />
                </Link>
              ))}
              <V1Link />
            </Stack>
          </MobileDrawer>
        </HiddenOnDesktop>
      </Flex>
      <ButtonGroup>
        <ConnectWalletButton />
      </ButtonGroup>
    </Nav>
  )
}

export default NavBar
