import { HamburgerIcon } from '@chakra-ui/icons'
import { Box, Flex, Stack, Text, useColorModeValue, useDisclosure, useTheme } from '@chakra-ui/react'
import Logo from '@public/logoTransparent.svg'
import Link from 'next/link'

import { useRewardsActive } from '@/components/pages/Rewards/hooks'
import { HiddenOnDesktop, HiddenOnMobile } from '@/components/shared/responsive'
import { useAddress } from '@/hooks/network'
import { usePositionViewManager } from '@/pages/trade'

import { Button, ButtonGroup, IconButton } from '@ds/Button'
import { MobileDrawer } from '@ds/MobileDrawer'

import ConnectWalletButton from './ConnectWalletButton'
import LinkSwitcher from './LinkSwitcher'
import MemoWalletSVG, { MemoHamburgerSVG } from './WalletIcon'
import { useNavCopy } from './hooks'
import { MobileButtonLabel, Nav, RewardsLink, V1Link } from './styles'

function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const theme = useTheme()
  const linkUnderlineColor = useColorModeValue(theme.colors.brand.blackAlpha[10], theme.colors.brand.whiteAlpha[10])
  const { address, overriding } = useAddress()
  const copy = useNavCopy()

  const { positionView, openPositionView, closePositonView } = usePositionViewManager()
  const isTestnet = typeof window !== 'undefined' && window.location.href.includes('testnet')
  const links = [
    { href: '/trade', label: 'Perps' },
    {
      href: isTestnet ? 'https://testnet.buffer.finance' : 'https://app.buffer.finance',
      label: 'Binary Options',
      external: true,
    },
    {
      href: '/rewards',
      label: 'Rewards',
      // external: true,
    },
  ]
  const rewardsActive = useRewardsActive()

  return (
    <Nav className="bg-[#232334] py-[2px] pl-1 pr-3 sm:py-2  ">
      <Flex>
        {typeof window !== 'undefined' && (
          <HiddenOnMobile>
            <LinkSwitcher links={links} />
          </HiddenOnMobile>
        )}
        <HiddenOnDesktop className="flex items-center gap-4 mx-gapbw">
          <MemoHamburgerSVG onClick={onOpen} />
          <MemoWalletSVG
            count={0}
            className={positionView ? 'text-1' : 'text-[#808191]'}
            onClick={positionView ? closePositonView : openPositionView}
          />
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
        {rewardsActive && <RewardsLink />}

        <ConnectWalletButton />
      </ButtonGroup>
    </Nav>
  )
}

export default NavBar
