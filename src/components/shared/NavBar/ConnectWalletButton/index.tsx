import { WarningIcon } from '@chakra-ui/icons'
import { Box, Image, Text, useBreakpointValue, useTheme } from '@chakra-ui/react'
import RedX from '@public/icons/red-x.svg'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useDisconnect } from 'wagmi'

import ToSModal from '@/components/ToSModal'
import { isSupportedChain, isTestnet } from '@/constants/network'
import { useAuthStatus } from '@/contexts/authStatusContext'
import { useAddress } from '@/hooks/network'
import { usePrevious } from '@/utils/hooks'

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
      {({
        openConnectModal,
        openAccountModal,
        openChainModal,
        authenticationStatus,
        chain,
        mounted,
        account,
        connectModalOpen,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const accountConnected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <ConnectWalletInner
            chain={chain}
            accountConnected={!!accountConnected}
            modalOpen={connectModalOpen}
            openAccountModal={openAccountModal}
            openConnectModal={openConnectModal}
            openChainModal={openChainModal}
            displayName={account?.displayName || ''}
          />
        )
      }}
    </ConnectButton.Custom>
  )
}

interface ConnectWalletInnerProps {
  chain?: {
    hasIcon: boolean
    iconUrl?: string
    iconBackground?: string
    id: number
    name?: string
    unsupported?: boolean
  }
  accountConnected: boolean
  modalOpen: boolean
  openAccountModal: () => void
  openConnectModal: () => void
  openChainModal: () => void
  displayName: string
}
const ConnectWalletInner: React.FC<ConnectWalletInnerProps> = ({
  chain,
  accountConnected,
  modalOpen,
  openAccountModal,
  openConnectModal,
  openChainModal,
  displayName,
}: ConnectWalletInnerProps) => {
  const { colors } = useTheme()
  const [showTosModal, setShowTosModal] = useState(false)
  const { connect, chain: chainCopy, close, testnet: testnetCopy } = useNavCopy()
  const isBase = useBreakpointValue({ base: true, md: false })
  const supported = isSupportedChain(chain?.id)
  const testnet = isTestnet(chain?.id)
  const { disconnect } = useDisconnect()
  const { address } = useAddress()
  const { authStatus, tosAccepted, setTosAccepted } = useAuthStatus()
  const prevModalOpen = usePrevious(modalOpen)

  useEffect(() => {
    // If the address is connected but ToS has not been accepted, disconnect them
    if (address && !tosAccepted) disconnect()
    // If the modal is no longer open and the connected address is not authed, disconnect them
    if (address && authStatus === 'unauthenticated' && prevModalOpen && !modalOpen) disconnect()
  }, [address, authStatus, modalOpen, prevModalOpen, tosAccepted, disconnect])

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
        {accountConnected && !isBase && (
          <Box position="relative">
            <IconButton
              aria-label={chainCopy}
              icon={
                supported ? (
                  <Image src={chain?.iconUrl || ''} alt={chain?.name || 'Connected Chain'} />
                ) : (
                  <WarningIcon color={colors.brand.red} />
                )
              }
              mr={1}
              onClick={openChainModal}
            />
            {testnet && (
              <Text position="absolute" fontSize="xx-small" top={0} width="100%" textAlign="center">
                {testnetCopy}
              </Text>
            )}
          </Box>
        )}
        {accountConnected && !isBase && <IconButton aria-label={close} icon={<RedX />} onClick={() => disconnect()} />}
      </ButtonGroup>
    </>
  )
}

export default ConnectWalletButton
