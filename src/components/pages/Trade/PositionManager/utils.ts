import { Row } from 'react-table'

import colors from '@/components/design-system/theme/colors'
import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { PositionStatus } from '@/constants/markets'
import { AssetSnapshots, LivePrices, PositionDetails, UserCurrentPositions } from '@/hooks/markets'
import { Big18Math, formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'

import { FormattedPositionDetail } from './constants'

export const calculatePnl = (positionDetails?: PositionDetails, livePriceDelta?: bigint) => {
  if (!positionDetails) return { pnl: '0', pnlPercentage: '0', isPnlPositive: false }
  let pnl = positionDetails.pnl || 0n

  // If there is a new price from offchain sources, update PnL with the difference
  if (livePriceDelta && positionDetails?.nextPosition) {
    const additionalPnl = Big18Math.mul(positionDetails.nextPosition, livePriceDelta)
    pnl = Big18Math.add(pnl, additionalPnl)
  }
  let pnlPercentage = '0'
  if (positionDetails?.startCollateral) {
    const deposits = positionDetails?.deposits ?? 0n
    // Only add deposits to the denominator if there is a net positive deposit
    const denominator = deposits > 0n ? positionDetails?.startCollateral + deposits : positionDetails?.startCollateral
    pnlPercentage = formatBig18Percent(Big18Math.abs(Big18Math.div(pnl, denominator)), {
      numDecimals: 2,
    })
  }
  return {
    pnl: formatBig18USDPrice(pnl),
    pnlPercentage,
    isPnlPositive: pnl > 0n,
  }
}

export const transformPositionDataToArray = (userPositions?: UserCurrentPositions) => {
  const result: FormattedPositionDetail[] = []
  if (!userPositions) return result
  for (const [_asset, positionData] of Object.entries(userPositions)) {
    const asset = _asset as SupportedAsset
    const symbol = AssetMetadata[asset].symbol
    if (positionData) {
      if (positionData?.Long && positionData?.Long.side === 'taker' && positionData?.Long?.currentCollateral !== 0n) {
        result.push({ asset, symbol, details: positionData?.Long })
      }
      if (
        positionData?.Short &&
        positionData?.Short.side === 'taker' &&
        positionData?.Short?.currentCollateral !== 0n
      ) {
        result.push({ asset, symbol, details: positionData?.Short })
      }
    }
  }
  return result
}

export const getCurrentPriceDelta = ({
  snapshots,
  asset,
  livePrices,
}: {
  snapshots?: AssetSnapshots
  asset: SupportedAsset
  livePrices: LivePrices
}) => {
  if (!snapshots) return undefined
  const selectedMarketSnapshot = snapshots[asset]
  const currentPrice = Big18Math.abs(
    selectedMarketSnapshot?.Long?.latestVersion?.price ?? selectedMarketSnapshot?.Short?.latestVersion?.price ?? 0n,
  )
  const pythPrice = livePrices[asset]
  // Use the live price to calculate real time pnl
  const currentPriceDelta = currentPrice > 0 && pythPrice ? pythPrice - currentPrice : undefined
  return currentPriceDelta
}

export const getFormattedPositionDetails = ({
  positionDetails,
  numSigFigs,
  placeholderString,
}: {
  positionDetails?: PositionDetails
  numSigFigs: number
  placeholderString: string
}) => ({
  currentCollateral: positionDetails ? formatBig18USDPrice(positionDetails?.currentCollateral) : placeholderString,
  startCollateral: positionDetails ? formatBig18USDPrice(positionDetails?.startCollateral) : placeholderString,
  position: positionDetails ? formatBig18(positionDetails?.position, { numSigFigs }) : placeholderString,
  nextPosition: positionDetails ? formatBig18(positionDetails?.nextPosition, { numSigFigs }) : placeholderString,
  averageEntry: positionDetails ? formatBig18USDPrice(positionDetails?.averageEntry) : placeholderString,
  liquidationPrice: positionDetails ? formatBig18USDPrice(positionDetails?.liquidationPrice) : placeholderString,
  unformattedLiquidationPrice: positionDetails
    ? formatBig18(positionDetails?.liquidationPrice, { numSigFigs: 8 })
    : placeholderString,
  notional: positionDetails ? formatBig18USDPrice(positionDetails?.notional) : placeholderString,
  nextNotional: positionDetails ? formatBig18USDPrice(positionDetails?.nextNotional) : placeholderString,
  unformattedNotional: positionDetails ? formatBig18(positionDetails?.notional) : placeholderString,
  leverage: positionDetails ? formatBig18(positionDetails?.leverage) : placeholderString,
  nextLeverage: positionDetails ? formatBig18(positionDetails?.nextLeverage) : placeholderString,
  fees: positionDetails ? formatBig18USDPrice(positionDetails?.fees) : placeholderString,
})

export const numericColumnSort = (rowA: Row, rowB: Row, id: string) => {
  const a = parseFloat(rowA.values[id])
  const b = parseFloat(rowB.values[id])
  if (a > b) {
    return 1
  }
  if (b > a) {
    return -1
  }
  return 0
}

export const getStatusDetails = (status: PositionStatus) => {
  const isOpenPosition =
    status === PositionStatus.open ||
    status === PositionStatus.pricing ||
    status === PositionStatus.closing ||
    status === PositionStatus.opening
  const isTransitionPosition =
    status === PositionStatus.pricing || status === PositionStatus.opening || status === PositionStatus.closing
  const statusColor = isOpenPosition ? (isTransitionPosition ? 'goldenRod' : colors.brand.green) : 'darkGray'

  return { isOpenPosition, isTransitionPosition, statusColor }
}
