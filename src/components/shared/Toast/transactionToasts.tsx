import { Link, Text, useToast } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { TransactionReceipt } from 'viem'
import { Address } from 'wagmi'
import { waitForTransaction } from 'wagmi/actions'

import { ExplorerNames, ExplorerURLs } from '@/constants/network'
import { useChainId } from '@/hooks/network'

import colors from '@ds/theme/colors'

import Toast from '.'

export const useTxToastCopy = () => {
  const intl = useIntl()
  return {
    error: intl.formatMessage({ defaultMessage: 'Error' }),
    defaultErrortMsg: intl.formatMessage({ defaultMessage: 'Something went wrong' }),
    errorFetchingPrice: intl.formatMessage({ defaultMessage: 'Error fetching price. Please try again.' }),
    priceStale: intl.formatMessage({ defaultMessage: 'Stale price error. Please try again.' }),
    errorPlacingOrder: intl.formatMessage({ defaultMessage: 'Error placing order. Please try again.' }),
    transactionFailedOnChain: (link: React.ReactNode) =>
      intl.formatMessage(
        {
          defaultMessage: 'Transaction failed on chain. Please try again.{link}',
        },
        { link },
      ),
    confirmed: intl.formatMessage({ defaultMessage: 'Transaction Confirmed' }),
    defaultConfirmedMsg: (link: React.ReactNode) =>
      intl.formatMessage({ defaultMessage: 'Your transaction has been confirmed.{link}' }, { link }),
    viewOnExplorer: (website: string) => intl.formatMessage({ defaultMessage: 'View on {website}' }, { website }),
    errorCancelingOrder: intl.formatMessage({ defaultMessage: 'Error canceling order. Please try again.' }),
  }
}

export const useTxToastTriggers = () => {
  const toast = useToast()
  const copy = useTxToastCopy()
  return {
    triggerErrorToast: ({ title = copy.error, message }: { title?: string; message?: string | React.ReactNode }) => {
      toast({
        render: ({ onClose }) => (
          <Toast title={title} body={message} onClose={onClose} error titleColor={colors.brand.red} />
        ),
      })
    },
    triggerConfirmationToast: ({
      title = copy.confirmed,
      message,
    }: {
      title?: string
      message?: string | React.ReactNode
    }) => {
      toast({
        render: ({ onClose }) => <Toast title={title} body={message} onClose={onClose} />,
      })
    },
  }
}

const TransactionLink = ({ transactionHash }: { transactionHash: Address }) => {
  const copy = useTxToastCopy()
  const chainId = useChainId()
  let baseUrl = ExplorerURLs[chainId]
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/'
  }
  const explorerUrl = `${baseUrl}tx/${transactionHash}`
  return (
    <Link isExternal href={explorerUrl} target="_blank" rel="noopener noreferrer">
      <Text
        as="span"
        textDecoration="underline"
        textUnderlineOffset={1}
        fontSize="12px"
        color={colors.brand.whiteAlpha[80]}
        _hover={{ color: colors.brand.whiteAlpha[90] }}
      >
        {copy.viewOnExplorer(ExplorerNames[chainId])}
      </Text>
    </Link>
  )
}

export const useTransactionToasts = () => {
  const { triggerErrorToast, triggerConfirmationToast } = useTxToastTriggers()
  const copy = useTxToastCopy()
  return {
    triggerErrorToast,
    triggerConfirmationToast,
    waitForTransactionAlert: (
      hash: Address,
      options?: { successMsg?: string; errorMsg?: string; onError?: () => void; onSuccess?: () => void },
    ) => {
      const { successMsg, errorMsg, onError, onSuccess } = options || {}
      return waitForTransaction({ hash })
        .then((res: TransactionReceipt) => {
          triggerConfirmationToast({
            title: copy.confirmed,
            message: successMsg ? successMsg : copy.defaultConfirmedMsg(<TransactionLink transactionHash={hash} />),
          })
          if (onSuccess) {
            onSuccess()
          }
          return res
        })
        .catch(() => {
          triggerErrorToast({
            title: copy.error,
            message: errorMsg ? errorMsg : copy.transactionFailedOnChain(<TransactionLink transactionHash={hash} />),
          })
          if (onError) {
            onError()
          }
        })
    },
  }
}
