import { useToast } from '@chakra-ui/react'
import { createContext, useEffect } from 'react'

import { useTradeFormCopy } from '@/components/pages/Trade/TradeForm/hooks'
import { calcPositionDifference } from '@/components/pages/Trade/TradeForm/utils'
import Toast, { ToastMessage } from '@/components/shared/Toast'
import { OrderDirection, PositionStatus } from '@/constants/markets'
import { useUserCurrentPositions } from '@/hooks/markets'
import { Big18Math } from '@/utils/big18Utils'
import { usePrevious } from '@/utils/hooks'

import colors from '@ds/theme/colors'

import { useMarketContext } from './marketContext'

const SettlementToastContext = createContext({})

export const SettlementToastProvider = ({ children }: { children: React.ReactNode }) => {
  const toast = useToast()
  const { selectedMarket, orderDirection } = useMarketContext()
  const { data: positions } = useUserCurrentPositions()
  const position = positions?.[selectedMarket]?.[orderDirection]
  const prevStatus = usePrevious(position?.status)
  const prevPosition = usePrevious(position?.position) ?? 0n
  const nextPosition = position?.nextPosition ?? 0n
  const copy = useTradeFormCopy()

  const status = position?.status
  const asset = position?.asset.toUpperCase()
  const direction = position?.direction === OrderDirection.Long ? copy.long : copy.short
  const amount = Big18Math.toFloatString(position?.nextPosition ?? 0n)

  useEffect(() => {
    if (asset && prevStatus === PositionStatus.closing && status === PositionStatus.closed) {
      const closeAmount = Big18Math.toFloatString(prevPosition ?? 0n)
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.positionSettled}
            onClose={onClose}
            body={
              <ToastMessage
                action={copy.close}
                actionColor={colors.brand.red}
                message={copy.orderDetailToast(closeAmount, asset, direction)}
              />
            }
          />
        ),
      })
    }

    if (asset && prevStatus === PositionStatus.opening && status === PositionStatus.open) {
      toast({
        render: ({ onClose }) => (
          <Toast
            title={copy.positionOpened}
            onClose={onClose}
            body={
              <ToastMessage
                action={copy.open}
                actionColor={colors.brand.green}
                message={copy.orderDetailToast(amount, asset, direction)}
              />
            }
          />
        ),
      })
    }

    if (asset && prevStatus === PositionStatus.pricing && status === PositionStatus.open) {
      const amount = Big18Math.toFloatString(Big18Math.abs(calcPositionDifference(prevPosition ?? 0n, nextPosition)))
      const action = nextPosition > prevPosition ? copy.increase : copy.decrease
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
  }, [prevStatus, status, toast, copy, asset, direction, position?.nextPosition])

  return <SettlementToastContext.Provider value={{}}>{children}</SettlementToastContext.Provider>
}
