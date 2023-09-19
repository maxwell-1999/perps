import { useIntl } from 'react-intl'

import { useAuthStatus } from '@/contexts/authStatusContext'
import { useAddress } from '@/hooks/network'

import { Button, ButtonProps } from '../design-system/Button'

interface Props extends ButtonProps {
  overrideLabel?: boolean
  actionAllowedInGeoblock?: boolean
}

export const TxButton = (props: Props) => {
  const intl = useIntl()
  const { geoblocked: geoblocked_ } = useAuthStatus()
  const { address, overriding } = useAddress()

  const geoblocked = geoblocked_ && !props.actionAllowedInGeoblock
  const appNotAvailable = intl.formatMessage({ defaultMessage: 'App Not Available' })
  const connectWallet = intl.formatMessage({ defaultMessage: 'Connect Wallet' })

  let label = props.label
  if (props.overrideLabel) {
    if (geoblocked) label = appNotAvailable
    else if (!address) label = connectWallet
  }

  const btnProps = { ...props }
  delete btnProps.overrideLabel
  delete btnProps.actionAllowedInGeoblock
  return <Button {...btnProps} isDisabled={geoblocked || overriding || !address || props.isDisabled} label={label} />
}
