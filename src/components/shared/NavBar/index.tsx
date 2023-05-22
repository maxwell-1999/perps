import {
  Box,
  Flex,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  useTheme,
} from '@chakra-ui/react'
import BurgerMenu from '@public/icons/burger.svg'
import RedX from '@public/icons/red-x.svg'
import Settings from '@public/icons/settings.svg'
import Logo from '@public/logoTransparent.svg'
import Link from 'next/link'
import { useAccount, useDisconnect } from 'wagmi'

import { Button, ButtonGroup, IconButton } from '@ds/Button'
import { MobileDrawer } from '@ds/MobileDrawer'

import ConnectWalletButton from './ConnectWalletButton'
import LinkSwitcher from './LinkSwitcher'
import { links } from './constants'
import { useNavCopy } from './hooks'
import { MobileButtonLabel, Nav } from './styles'

function NavBar() {
  const { disconnect } = useDisconnect()
  const { address } = useAccount()
  const isBase = useBreakpointValue({ base: true, sm: false })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const theme = useTheme()
  const linkUnderlineColor = useColorModeValue(theme.colors.brand.blackAlpha[10], theme.colors.brand.whiteAlpha[10])

  const copy = useNavCopy()

  return (
    <Nav>
      <Flex>
        {!isBase ? (
          <LinkSwitcher links={links} />
        ) : (
          <>
            <IconButton aria-label={copy.menu} icon={<BurgerMenu />} onClick={onOpen} />
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
                  <Link href={link.href} key={link.href} passHref>
                    <Button label={<MobileButtonLabel label={link.label} />} variant="text" width="100%" />
                    <Box height="1px" width="100%" bg={linkUnderlineColor} mt={2} />
                  </Link>
                ))}
              </Stack>
            </MobileDrawer>
          </>
        )}
      </Flex>
      <ButtonGroup>
        <ConnectWalletButton />
        {!isBase && <IconButton aria-label={copy.settings} icon={<Settings />} mr={1} />}
        {Boolean(address) && !isBase && (
          <IconButton aria-label={copy.close} icon={<RedX />} onClick={() => disconnect()} />
        )}
      </ButtonGroup>
    </Nav>
  )
}

export default NavBar
