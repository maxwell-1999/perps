import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import {
  Flex,
  Stack,
  Box,
  Text,
  useBreakpointValue,
  useDisclosure,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import LinkSwitcher from "./LinkSwitcher";
import { IconButton, ButtonGroup, Button } from "@ds/Button";
import { MobileDrawer } from "@ds/MobileDrawer";
import ConnectWalletButton from "./ConnectWalletButton";
import { Nav, MobileButtonLabel } from "./styles";
import { links } from "./constants";

import Settings from "@public/icons/settings.svg";
import RedX from "@public/icons/red-x.svg";
import BurgerMenu from "@public/icons/burger.svg";
import Logo from "@public/logoTransparent.svg";

function NavBar() {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const isBase = useBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const theme = useTheme();
  const linkColor = useColorModeValue("black", "white");
  const linkUnderlineColor = useColorModeValue(
    theme.colors.brand.blackAlpha[10],
    theme.colors.brand.whiteAlpha[10],
  );

  return (
    <Nav>
      <Flex>
        {!isBase ? (
          <LinkSwitcher links={links} />
        ) : (
          <>
            <IconButton aria-label="menu" icon={<BurgerMenu />} onClick={onOpen} />
            <MobileDrawer
              isOpen={isOpen}
              placement="left"
              onClose={onClose}
              header={
                <Flex alignItems="center">
                  <Box mr={3}>
                    <Logo />
                  </Box>
                  <Text>Perennial</Text>
                </Flex>
              }
            >
              <Stack>
                {links.map((link) => (
                  <Link href={link.href} key={link.href} passHref>
                    <Button
                      label={<MobileButtonLabel label={link.label} />}
                      variant="text"
                      width="100%"
                      color={linkColor}
                    />
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
        {!isBase && <IconButton aria-label="settings" icon={<Settings />} mr={1} />}
        {Boolean(address) && !isBase && (
          <IconButton aria-label="close" icon={<RedX />} onClick={() => disconnect()} />
        )}
      </ButtonGroup>
    </Nav>
  );
}

export default NavBar;
