import React, { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

type TradingViewWidgetProps = {
  symbol: string;
  overrides?: any;
  theme?: "light" | "dark";
};

let tvScriptLoadingPromise: Promise<any> | null = null;

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, overrides, theme }) => {
  const onLoadScriptRef = useRef<(() => void) | null>(null);

  const createWidget = useCallback(() => {
    if (document.getElementById("tv-widget-container") && "TradingView" in window) {
      new window.TradingView.widget({
        symbol,
        theme,
        overrides,
        autosize: true,
        height: "100%",
        width: "100%",
        locale: "en",
        hide_top_toolbar: true,
        hide_side_toolbar: true,
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: "tv-widget-container",
        loading_screen: { backgroundColor: "#000000" },
      });
    }
  }, [symbol, theme, overrides]);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = loadTradingViewScript();
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => {
      onLoadScriptRef.current = null;
    };
  }, [createWidget]);

  return <div id="tv-widget-container" />;
};

function loadTradingViewScript(): Promise<any> {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = "tradingview-widget-loading-script";
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

export default TradingViewWidget;
