import Logo from '@public/logoTransparent.svg'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Button, ButtonGroup, IconButton } from '@ds/Button'

import { useNavCopy } from '../hooks'

interface NavLinkProps {
  href: string
  label: string
  external?: boolean
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, external }) => {
  const { pathname } = useRouter()
  const isActive = pathname === href.toLowerCase()

  return (
    <Link href={href} passHref target={external ? '_blank' : ''}>
      <button
        className={`transition-all duration-300 text-4 text-f15  px-4 py-[4px] text-[#808191] hover:bg-[#232334] rounded-[8px] ${
          isActive ? '!text-1 bg-3' : 'hover:bg-1 hover:text-1 hover:brightness-125'
        } 
        `}
      >
        {label}
      </button>
    </Link>
  )
}

interface LinkSwitcherProps {
  links: NavLinkProps[]
}

const LinkSwitcher: React.FC<LinkSwitcherProps> = ({ links }) => {
  const { home } = useNavCopy()
  return (
    <div className="flex items-center gap-2">
      <Link href="/" passHref>
        <IconButton variant="invisible" className="scale-[1.1] !w-fit" aria-label={home} icon={<Logo />} />
      </Link>
      {links.map((link) => (
        <NavLink key={link.href} href={link.href} label={link.label} external={!!link.external} />
      ))}
    </div>
  )
}

export default LinkSwitcher
