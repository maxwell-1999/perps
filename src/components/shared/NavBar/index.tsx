import { Flex } from "@chakra-ui/react";
import LinkSwitcher from "../LinkSwitcher";
import { links } from "./constants";
import { IconButton, Button, ButtonGroup } from "@ds/Button";
import { Nav } from "./styles";
import Settings from "@public/icons/settings.svg";
import RedX from "@public/icons/red-x.svg";

function NavBar() {
  return (
    <Nav>
      <Flex>
        <LinkSwitcher links={links} />
      </Flex>
      <ButtonGroup>
        <Button variant="transparent" label="lorem ipsum" />
        <IconButton aria-label="settings" icon={<Settings />} mr={1} />
        <IconButton aria-label="close" icon={<RedX />} />
      </ButtonGroup>
    </Nav>
  );
}

export default NavBar;
