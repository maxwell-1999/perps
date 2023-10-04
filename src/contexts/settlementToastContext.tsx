import { useToast } from '@chakra-ui/react'
import { createContext, useEffect } from 'react'

import { useTradeFormCopy } from '@/components/pages/Trade/TradeForm/hooks'
import { calcPositionDifference } from '@/components/pages/Trade/TradeForm/utils'
import Toast, { ToastMessage } from '@/components/shared/Toast'
import { PositionSide2, PositionStatus } from '@/constants/markets'
import { Big6Math } from '@/utils/big6Utils'
import { usePrevious } from '@/utils/hooks'

import colors from '@ds/theme/colors'

import { useMarketContext } from './marketContext'

const SettlementToastContext = createContext({})

export const SettlementToastProvider = ({ children }: { children: React.ReactNode }) => {
  const toast = useToast()
  const { userCurrentPosition, selectedMarketSnapshot2, isMaker } = useMarketContext()
  const prevPosition = usePrevious(userCurrentPosition)
  const copy = useTradeFormCopy()
  const direction = isMaker ? copy.maker : userCurrentPosition?.side === PositionSide2.long ? copy.long : copy.short

  useEffect(() => {
    if (!prevPosition || !userCurrentPosition || prevPosition.asset !== userCurrentPosition.asset) {
      return
    }

    const { asset, status, nextMagnitude } = userCurrentPosition
    const amount = Big6Math.toFloatString(nextMagnitude ?? 0n)

    if (prevPosition?.status === PositionStatus.closing && status === PositionStatus.closed) {
      const closeAmount = Big6Math.toFloatString(prevPosition?.magnitude ?? 0n)
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.positionSettled}
            onClose={onClose}
            body={
              <ToastMessage
                action={copy.close}
                actionColor={colors.brand.red}
                message={copy.orderDetailToast(
                  closeAmount,
                  asset.toUpperCase(),
                  isMaker ? copy.maker.toLowerCase() : direction,
                )}
              />
            }
          />
        ),
      })
    }

    if (prevPosition.status === PositionStatus.opening && status === PositionStatus.open) {
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.positionOpened}
            onClose={onClose}
            body={
              <ToastMessage
                action={copy.open}
                actionColor={colors.brand.green}
                message={copy.orderDetailToast(amount, asset, direction.toLowerCase())}
              />
            }
          />
        ),
      })
    }

    if (prevPosition.status === PositionStatus.pricing && status === PositionStatus.open) {
      const amount = Big6Math.toFloatString(
        Big6Math.abs(calcPositionDifference(prevPosition?.magnitude ?? 0n, nextMagnitude)),
      )
      const action = nextMagnitude > prevPosition?.magnitude ? copy.increase : copy.decrease
      const actionColor = action === copy.increase ? colors.brand.green : colors.brand.red
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.orderSettled}
            onClose={onClose}
            body={
              <ToastMessage
                action={action}
                actionColor={actionColor}
                message={copy.orderDetailToast(amount, asset, direction)}
              />
            }
          />
        ),
      })
    }

    if (prevPosition.status !== PositionStatus.failed && userCurrentPosition.status === PositionStatus.failed) {
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.settlementFailure}
            onClose={onClose}
            body={
              <ToastMessage
                action={copy.settlementFailureTitle}
                actionColor={colors.brand.red}
                message={copy.settlementFailureBody}
              />
            }
          />
        ),
      })
    }
  }, [toast, copy, direction, selectedMarketSnapshot2?.versions, prevPosition, userCurrentPosition, isMaker])

  return <SettlementToastContext.Provider value={{}}>{children}</SettlementToastContext.Provider>
}
