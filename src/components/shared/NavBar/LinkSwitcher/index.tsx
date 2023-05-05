import { useRouter } from "next/router";
import Link from "next/link";
import { Button, ButtonGroup, IconButton } from "../../../design-system/Button";
import Logo from "@public/logoTransparent.svg";

interface NavLinkProps {
  href: string;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label }) => {
  const { pathname } = useRouter();
  const isActive = pathname === href.toLowerCase();

  return (
    <Link href={href} passHref>
      <Button label={label} variant={isActive ? "transparent" : "ghost"} />
    </Link>
  );
};

interface LinkSwitcherProps {
  links: NavLinkProps[];
}

const LinkSwitcher: React.FC<LinkSwitcherProps> = ({ links }) => {
  return (
    <ButtonGroup>
      <Link href="/" passHref>
        <IconButton variant="invisible" aria-label="home" icon={<Logo />} mr={1} />
      </Link>
      {links.map((link) => (
        <NavLink key={link.href} href={link.href} label={link.label} />
      ))}
    </ButtonGroup>
  );
};

export default LinkSwitcher;
