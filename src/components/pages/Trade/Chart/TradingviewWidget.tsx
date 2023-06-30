import React, { useCallback, useEffect, useMemo } from 'react'

import colors from '@/components/design-system/theme/colors'
import { AssetMetadata } from '@/constants/assets'
import { useMarketContext } from '@/contexts/marketContext'
import { useUserCurrentPositions } from '@/hooks/markets'
import { usePyth } from '@/hooks/network'
import { Big18Math, formatBig18 } from '@/utils/big18Utils'
import { usePrevious } from '@/utils/hooks'

import {
  CustomFormatters,
  IChartingLibraryWidget,
  ResolutionString,
  widget,
} from '@t/tradingview/charting_library/charting_library'

import Datafeed from './datafeed'

declare global {
  interface Window {
    TradingView: {
      widget: typeof widget
    }
  }
}

type TradingViewWidgetProps = {
  overrides?: any
  theme?: 'light' | 'dark'
  containerId: string
}

const ChartOverrides = {
  'paneProperties.backgroundType': 'solid',
  'paneProperties.background': colors.brand.blackSolid[5],
  'paneProperties.vertGridProperties.color': colors.brand.blackSolid[10],
  'paneProperties.horzGridProperties.color': colors.brand.blackSolid[10],
  'symbolWatermarkProperties.transparency': 90,
  'scalesProperties.textColor': colors.brand.gray[100],
  'scalesProperties.showSymbolLabels': false,
  // 'mainSeriesProperties.candleStyle.upColor': colors.brand.green,
  // 'mainSeriesProperties.candleStyle.downColor': colors.brand.red,
}

let tvWidget: IChartingLibraryWidget | null = null
let tvChartReady = false
let datafeed: Datafeed | null = null
let tvScriptLoadingPromise: Promise<void> | null = null

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ overrides, theme, containerId }) => {
  const pyth = usePyth()
  const { selectedMarket } = useMarketContext()

  const { tvTicker, displayDecimals } = useMemo(() => AssetMetadata[selectedMarket], [selectedMarket])
  const { data: positions } = useUserCurrentPositions()

  const prevTicker = usePrevious(tvTicker)

  const createWidget = useCallback(() => {
    tvWidget = new window.TradingView.widget({
      container: containerId,
      locale: 'en',
      library_path: '/tradingview/charting_library/',
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      datafeed: datafeed!,
      interval: '5' as ResolutionString,
      timeframe: '6H',
      symbol: tvTicker,
      autosize: true,
      toolbar_bg: colors.brand.blackSolid[5],
      enabled_features: ['hide_left_toolbar_by_default'],
      disabled_features: ['display_market_status', 'header_symbol_search', 'header_compare', 'study_templates'],
      loading_screen: { foregroundColor: colors.brand.purple[240], backgroundColor: colors.brand.blackSolid[5] },
      theme,
      custom_css_url: '/tradingview/charting_library/custom.css',
      overrides: ChartOverrides,
      settings_overrides: ChartOverrides,
      custom_formatters: {
        priceFormatterFactory: () => ({
          format: (price: number) =>
            formatBig18(Big18Math.fromFloatString(price.toString()), {
              numSigFigs: displayDecimals + 2,
              useGrouping: false,
            }),
        }),
      } as unknown as CustomFormatters,
    })
    tvWidget.onChartReady(() => {
      tvChartReady = true
      tvWidget?.applyOverrides(overrides)
    })
  }, [tvTicker, displayDecimals, theme, overrides, containerId])

  useEffect(() => {
    const setup = async () => {
      if (!tvScriptLoadingPromise) {
        tvScriptLoadingPromise = loadTradingViewScript().then(loadDatafeedScript)
      }

      await tvScriptLoadingPromise

      if (datafeed === null) datafeed = new Datafeed('/api/tv', pyth, positions)
      else datafeed.positions = positions

      if (!tvWidget) createWidget()
      else if (tvWidget && tvChartReady && prevTicker !== tvTicker) {
        tvWidget.setSymbol(tvTicker, '5' as ResolutionString, () => {})
      }
    }

    setup()
  }, [createWidget, prevTicker, tvTicker, pyth, positions])

  useEffect(() => {
    return () => {
      if (tvWidget) {
        tvWidget.remove()
        tvWidget = null
      }
      if (tvChartReady) tvChartReady = false
    }
  }, [])

  return <></>
}

function loadTradingViewScript(): Promise<any> {
  return new Promise((resolve) => {
    if (document.getElementById('tradingview-widget-loading-script') !== null) return resolve(true)
    const script = document.createElement('script')
    script.id = 'tradingview-widget-loading-script'
    script.src = '/tradingview/charting_library/charting_library.standalone.js'
    script.type = 'text/javascript'
    script.onload = resolve
    document.head.appendChild(script)
  })
}

// tmp testing demo datafeed
function loadDatafeedScript(): Promise<any> {
  return new Promise((resolve) => {
    if (document.getElementById('tradingview-widget-loading-script-data') !== null) return resolve(true)
    // tmp testing demo datafeed
    const script2 = document.createElement('script')
    script2.id = 'tradingview-widget-loading-script-data'
    script2.src = '/tradingview/datafeeds/udf/dist/bundle.js'
    script2.type = 'text/javascript'
    script2.onload = resolve
    document.head.appendChild(script2)
  })
}

export default TradingViewWidget
