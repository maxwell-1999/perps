import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'

import { AssetMetadata } from '@/constants/assets'
import { UserCurrentPositions } from '@/hooks/markets'
import { Big18Math } from '@/utils/big18Utils'
import { Minute, Second } from '@/utils/timeUtils'

import {
  ErrorCallback,
  GetMarksCallback,
  HistoryCallback,
  LibrarySymbolInfo,
  Mark,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
  SymbolResolveExtension,
} from '@t/tradingview/charting_library/charting_library'
import { UDFCompatibleDatafeed } from '@t/tradingview/datafeeds/udf/types'

declare global {
  interface Window {
    Datafeeds: {
      UDFCompatibleDatafeed: typeof UDFCompatibleDatafeed
    }
  }
}
class Datafeed {
  public positions?: UserCurrentPositions

  private baseFeed: UDFCompatibleDatafeed
  private pyth: EvmPriceServiceConnection

  constructor(url: string, pyth: EvmPriceServiceConnection, positions?: UserCurrentPositions) {
    this.baseFeed = new window.Datafeeds.UDFCompatibleDatafeed(url, Number(60n * Second))
    this.pyth = pyth
    this.positions = positions
  }

  onReady(callback: OnReadyCallback) {
    this.baseFeed.onReady(callback)
  }

  searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: SearchSymbolsCallback) {
    this.baseFeed.searchSymbols(userInput, exchange, symbolType, onResult)
  }

  resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback,
    extension?: SymbolResolveExtension,
  ) {
    this.baseFeed.resolveSymbol(symbolName, onResolve, onError, extension)
  }

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback,
  ) {
    this.baseFeed.getBars(symbolInfo, resolution, periodParams, onResult, onError)
  }

  subscribeBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: SubscribeBarsCallback) {
    const metadata = this.metadataForSymbol(symbolInfo.ticker)
    if (!metadata?.pythFeedId) return
    const pythFeedId = metadata.pythFeedId

    this.pyth.subscribePriceFeedUpdates([pythFeedId], (priceFeed) => {
      const price = priceFeed.getPriceNoOlderThan(60)
      if (price) {
        const floatPrice = Number(price.price) * 10 ** price.expo
        onTick({
          time: price.publishTime * 1000,
          close: floatPrice,
          open: floatPrice,
          high: floatPrice,
          low: floatPrice,
        })
      }
    })
  }

  unsubscribeBars() {
    return
  }

  getMarks(
    symbolInfo: LibrarySymbolInfo,
    from: number,
    to: number,
    onDataCallback: GetMarksCallback<Mark>,
    resolution: ResolutionString,
  ) {
    const marks: Mark[] = []
    const metadata = this.metadataForSymbol(symbolInfo.ticker)
    if (!metadata || !this.positions?.[metadata.baseCurrency]) return
    const position = this.positions[metadata.baseCurrency]

    position?.Long?.subPositions?.forEach((subPosition, i) => {
      const timestamp = Number(Big18Math.max(subPosition.settleTimestamp, subPosition.blockTimestamp))
      if (timestamp >= from && timestamp <= to) {
        marks.push({
          id: subPosition.blockNumber.toString(),
          time: Math.round(timestamp / Number(BigInt(resolution) * Minute)) * Number(BigInt(resolution) * Minute),
          color: 'green',
          labelFontColor: 'white',
          text: i === 0 ? 'Position Opened' : 'Position Modified',
          label: i === 0 ? 'O' : 'M',
          minSize: 14,
        })
      }
    })

    position?.Short?.subPositions?.forEach((subPosition, i) => {
      const timestamp = Number(Big18Math.max(subPosition.settleTimestamp, subPosition.blockTimestamp))
      if (timestamp >= from && timestamp <= to) {
        marks.push({
          id: subPosition.blockNumber.toString(),
          time: Math.round(timestamp / Number(BigInt(resolution) * Minute)) * Number(BigInt(resolution) * Minute),
          color: 'red',
          labelFontColor: 'white',
          text: i === 0 ? 'Position Opened' : 'Position Modified',
          label: i === 0 ? 'O' : 'M',
          minSize: 14,
        })
      }
    })

    onDataCallback(marks)
  }

  metadataForSymbol(ticker?: string) {
    const metadata = Object.entries(AssetMetadata).find(([, value]) => {
      return value.tvTicker === ticker
    })
    return metadata?.[1]
  }
}

export default Datafeed
