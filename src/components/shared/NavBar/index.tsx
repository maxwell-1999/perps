import { Flex } from "@chakra-ui/react";
import { useAccount, useDisconnect } from "wagmi";
import LinkSwitcher from "./LinkSwitcher";
import { links } from "./constants";
import { IconButton, ButtonGroup } from "@ds/Button";
import { Nav } from "./styles";
import ConnectWalletButton from "./ConnectWalletButton";
import Settings from "@public/icons/settings.svg";
import RedX from "@public/icons/red-x.svg";

function NavBar() {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  return (
    <Nav>
      <Flex>
        <LinkSwitcher links={links} />
      </Flex>
      <ButtonGroup>
        <ConnectWalletButton />
        <IconButton aria-label="settings" icon={<Settings />} mr={1} />
        {Boolean(address) && (
          <IconButton aria-label="close" icon={<RedX />} onClick={() => disconnect()} />
        )}
      </ButtonGroup>
    </Nav>
  );
}

export default NavBar;
