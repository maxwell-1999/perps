import { Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "../design-system/Button";

interface NavLinkProps {
  href: string;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label }) => {
  const { pathname } = useRouter();
  const isActive = pathname === href;

  return (
    <Link href={href} passHref>
      <Button label={label} variant={isActive ? "transparent" : "ghost"} mr={1} />
    </Link>
  );
};

interface LinkSwitcherProps {
  links: NavLinkProps[];
}

const LinkSwitcher: React.FC<LinkSwitcherProps> = ({ links }) => {
  return (
    <Flex p={4}>
      {links.map((link) => (
        <NavLink key={link.href} href={link.href} label={link.label} />
      ))}
    </Flex>
  );
};

export default LinkSwitcher;
