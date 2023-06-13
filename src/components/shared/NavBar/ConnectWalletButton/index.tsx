import { useBreakpointValue } from '@chakra-ui/react'
import RedX from '@public/icons/red-x.svg'
import Settings from '@public/icons/settings.svg'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useDisconnect } from 'wagmi'

import ToSModal from '@/components/ToSModal'
import { useAuthStatus } from '@/contexts/authStatusContext'
import { useAddress } from '@/hooks/network'

import { Button, ButtonGroup, IconButton } from '@ds/Button'

import { useNavCopy } from '../hooks'

const formatAddress = (address: string) => address.replace(/•+/g, '...')

const ConnectWalletButton: React.FC = () => {
  const { overriding } = useAddress()

  if (overriding) {
    // eslint-disable-next-line formatjs/no-literal-string-in-jsx
    return <Button label="!OVERRIDE!" variant="transparent" />
  }

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, openAccountModal, authenticationStatus, chain, mounted, account, connectModalOpen }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const accountConnected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <ConnectWalletInner
            accountConnected={!!accountConnected}
            modalOpen={connectModalOpen}
            openAccountModal={openAccountModal}
            openConnectModal={openConnectModal}
            displayName={account?.displayName || ''}
          />
        )
      }}
    </ConnectButton.Custom>
  )
}

interface ConnectWalletInnerProps {
  accountConnected: boolean
  modalOpen: boolean
  openAccountModal: () => void
  openConnectModal: () => void
  displayName: string
}
const ConnectWalletInner: React.FC<ConnectWalletInnerProps> = ({
  accountConnected,
  modalOpen,
  openAccountModal,
  openConnectModal,
  displayName,
}: ConnectWalletInnerProps) => {
  const [showTosModal, setShowTosModal] = useState(false)
  const { connect, settings, close } = useNavCopy()
  const isBase = useBreakpointValue({ base: true, md: false })
  const { disconnect } = useDisconnect()
  const { address } = useAddress()
  const { authStatus, tosAccepted, setTosAccepted } = useAuthStatus()

  useEffect(() => {
    // If the address is connected but ToS has not been accepted, disconnect them
    if (address && !tosAccepted) disconnect()
    // If the modal is no longer open and the connected address is not authed, disconnect them
    if (address && authStatus !== 'authenticated' && !modalOpen) disconnect()
  }, [address, authStatus, modalOpen, tosAccepted, disconnect])

  const onClickConnect = () => {
    if (!tosAccepted) {
      setShowTosModal(true)
      return
    }
    if (accountConnected) {
      openAccountModal()
      return
    }

    return openConnectModal()
  }

  return (
    <>
      {showTosModal && (
        <ToSModal
          onAccept={() => {
            setTosAccepted(true)
            setShowTosModal(false)
            openConnectModal()
          }}
          onDecline={() => setShowTosModal(false)}
        />
      )}
      <ButtonGroup>
        <Button
          label={accountConnected ? formatAddress(displayName as string) : connect}
          onClick={onClickConnect}
          variant="transparent"
        />
        {accountConnected && !isBase && <IconButton aria-label={settings} icon={<Settings />} mr={1} />}
        {accountConnected && !isBase && <IconButton aria-label={close} icon={<RedX />} onClick={() => disconnect()} />}
      </ButtonGroup>
    </>
  )
}

export default ConnectWalletButton
