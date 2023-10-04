import { Row } from 'react-table'

import { AssetMetadata, PositionSide2, SupportedAsset } from '@/constants/markets'
import { MarketSnapshot, UserMarketSnapshot } from '@/hooks/markets2'
import { Big6Math, formatBig6, formatBig6Percent, formatBig6USDPrice } from '@/utils/big6Utils'
import { calcLiquidationPrice, calcLpUtilization, isActivePosition, isFailedClose } from '@/utils/positionUtils'

import { FormattedPositionDetail } from './constants'

export const transformPositionDataToArray = (
  userPositions?: Record<SupportedAsset, UserMarketSnapshot>,
  isMaker?: boolean,
) => {
  const result: FormattedPositionDetail[] = []
  if (!userPositions) return result
  for (const [_asset, positionData] of Object.entries(userPositions)) {
    const asset = _asset as SupportedAsset
    const symbol = AssetMetadata[asset].symbol
    if (isActivePosition(positionData)) {
      if (isMaker && (positionData.side === PositionSide2.maker || positionData.nextSide === PositionSide2.maker)) {
        result.push({ asset, symbol, details: positionData })
      }
      if (!isMaker && positionData.side !== PositionSide2.maker) {
        result.push({ asset, symbol, details: positionData })
      }
    }
  }
  return result
}

export const getFormattedPositionDetails = ({
  userMarketSnapshot,
  marketSnapshot,
  numSigFigs,
  placeholderString,
}: {
  userMarketSnapshot?: UserMarketSnapshot
  marketSnapshot?: MarketSnapshot
  numSigFigs: number
  placeholderString: string
}) => {
  if (!userMarketSnapshot || !isActivePosition(userMarketSnapshot)) {
    return {
      currentCollateral: placeholderString,
      startCollateral: placeholderString,
      position: placeholderString,
      nextPosition: placeholderString,
      liquidationPrice: placeholderString,
      unformattedLiquidationPrice: placeholderString,
      notional: placeholderString,
      nextNotional: placeholderString,
      unformattedNotional: placeholderString,
      leverage: placeholderString,
      nextLeverage: placeholderString,
      fees: placeholderString,
      liquidationFee: placeholderString,
      exposure: placeholderString,
      exposureSide: placeholderString,
      failedClose: false,
    }
  }
  const failedClose = isFailedClose(userMarketSnapshot)

  const liquidationPrices = calcLiquidationPrice({
    marketSnapshot,
    position: failedClose ? userMarketSnapshot?.magnitude : userMarketSnapshot?.nextMagnitude,
    collateral: userMarketSnapshot?.local?.collateral,
  })

  const liquidationPrice =
    userMarketSnapshot.nextSide === PositionSide2.long ? liquidationPrices.long : liquidationPrices.short

  const below1xLeverage = userMarketSnapshot?.nextLeverage <= Big6Math.ONE

  const lpUtilization = calcLpUtilization(marketSnapshot)
  const isMakerPosition = userMarketSnapshot?.side === PositionSide2.maker
  const makerExposure = isMakerPosition
    ? getMakerExposure(
        lpUtilization?.lpUtilization,
        failedClose ? userMarketSnapshot?.leverage : userMarketSnapshot?.nextLeverage,
      )
    : 0n

  return {
    currentCollateral: formatBig6USDPrice(userMarketSnapshot?.local?.collateral),
    startCollateral: formatBig6USDPrice(userMarketSnapshot?.local?.collateral), // TODO: await graph
    position: formatBig6(userMarketSnapshot?.magnitude, { numSigFigs }),
    nextPosition: formatBig6(userMarketSnapshot?.nextMagnitude, { numSigFigs }),
    liquidationPrice: below1xLeverage ? placeholderString : formatBig6USDPrice(liquidationPrice),
    unformattedLiquidationPrice: placeholderString, // TODO: implement
    notional: formatBig6USDPrice(userMarketSnapshot?.notional),
    nextNotional: formatBig6USDPrice(userMarketSnapshot?.nextNotional),
    unformattedNotional: placeholderString, // TODO: implement
    leverage: formatBig6(userMarketSnapshot?.leverage),
    nextLeverage: formatBig6(userMarketSnapshot?.nextLeverage),
    fees: placeholderString, // TODO: implement
    liquidationFee: placeholderString, // TODO: implement
    makerExposure: formatBig6Percent(makerExposure, { numDecimals: 2 }),
    exposureSide: lpUtilization?.exposureSide ?? placeholderString,
    failedClose,
  }
}

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

export const getMakerExposure = (lpUtililization?: bigint, leverage?: bigint) => {
  if (!lpUtililization || !leverage) return 0n
  return Big6Math.mul(lpUtililization, leverage)
}
