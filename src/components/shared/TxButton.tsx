import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { useRef } from 'react'
import { useIntl } from 'react-intl'
import { TransactionReceipt } from 'viem'

import { useAuthStatus } from '@/contexts/authStatusContext'
import { useAddress } from '@/hooks/network'
import { useOperators } from '@/hooks/wallet'

import { Button, ButtonProps } from '../design-system/Button'
import ApproveOperatorModal from './ApproveOperatorModal'

interface Props extends ButtonProps {
  overrideLabel?: boolean
  actionAllowedInGeoblock?: boolean
  formRef?: React.RefObject<HTMLFormElement>
  skipMarketFactoryApproval?: boolean
}

export const TxButton = (props: Props) => {
  const intl = useIntl()
  const [showApproveOperatorModal, setShowApproveOperatorModal] = useState(false)
  const { geoblocked: geoblocked_ } = useAuthStatus()
  const { address, overriding } = useAddress()
  const { data: operatorData } = useOperators()
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const geoblocked = geoblocked_ && !props.actionAllowedInGeoblock
  const appNotAvailable = intl.formatMessage({ defaultMessage: 'App Not Available' })
  const connectWallet = intl.formatMessage({ defaultMessage: 'Connect Wallet' })

  let label = props.label
  if (props.overrideLabel) {
    if (geoblocked) label = appNotAvailable
    else if (!address) label = connectWallet
  }

  const { formRef, skipMarketFactoryApproval, ...btnProps } = props

  delete btnProps.overrideLabel
  delete btnProps.actionAllowedInGeoblock
  const { openConnectModal } = useConnectModal()
  if (!address)
    return (
      <Button
        ref={btnRef}
        onClick={() => {
          openConnectModal?.()
        }}
        label={label}
      />
    )
  if (!skipMarketFactoryApproval && !operatorData?.marketFactoryApproved) {
    delete btnProps.type
    return (
      <>
        <Button
          ref={btnRef}
          {...btnProps}
          isDisabled={geoblocked || overriding || props.isDisabled}
          onClick={() => {
            setShowApproveOperatorModal(true)
          }}
          label={label}
        />
        {showApproveOperatorModal && (
          <ApproveOperatorModal
            onClose={(receipt?: TransactionReceipt) => {
              if (receipt?.status === 'success') {
                if (props.type === 'submit' && formRef) {
                  formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                } else if (btnProps.onClick) {
                  const mockEvent = {
                    preventDefault: () => {},
                    stopPropagation: () => {},
                  }
                  btnProps.onClick(mockEvent as any)
                }
              }
              setShowApproveOperatorModal(false)
            }}
          />
        )}
      </>
    )
  }

  return <Button {...btnProps} isDisabled={geoblocked || overriding || !address || props.isDisabled} label={label} />
}
