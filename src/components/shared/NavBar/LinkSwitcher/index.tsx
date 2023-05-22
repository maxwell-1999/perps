import Logo from '@public/logoTransparent.svg'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Button, ButtonGroup, IconButton } from '@ds/Button'

import { useNavCopy } from '../hooks'

interface NavLinkProps {
  href: string
  label: string
}

const NavLink: React.FC<NavLinkProps> = ({ href, label }) => {
  const { pathname } = useRouter()
  const isActive = pathname === href.toLowerCase()

  return (
    <Link href={href} passHref>
      <Button label={label} variant={isActive ? 'transparent' : 'text'} p={3} />
    </Link>
  )
}

interface LinkSwitcherProps {
  links: NavLinkProps[]
}

const LinkSwitcher: React.FC<LinkSwitcherProps> = ({ links }) => {
  const { home } = useNavCopy()
  return (
    <ButtonGroup>
      <Link href="/" passHref>
        <IconButton variant="invisible" aria-label={home} icon={<Logo />} mr={2} />
      </Link>
      {links.map((link) => (
        <NavLink key={link.href} href={link.href} label={link.label} />
      ))}
    </ButtonGroup>
  )
}

export default LinkSwitcher
