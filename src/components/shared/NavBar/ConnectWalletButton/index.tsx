import { ConnectButton } from '@rainbow-me/rainbowkit'

import { AccountDropdown } from './AccountsDropdown'

const formatAddress = (address: string) => address.replace(/•+/g, '...')

const ConnectWalletButton: React.FC = () => {
  return <AccountDropdown />
}

export default ConnectWalletButton
