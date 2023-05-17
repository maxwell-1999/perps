import dynamic from "next/dynamic";
import { Container } from "@/components/design-system";
import { ASSET_METADATA } from "@/constants/currencies";
import { useMarketContext } from "@/contexts/marketContext";

const AdvancedRealTimeChart = dynamic(() => import("./TradingviewWidget"), { ssr: false });

function Chart() {
  const { selectedMarket } = useMarketContext();

  return (
    <Container height="100%" p={0}>
      <AdvancedRealTimeChart
        key={ASSET_METADATA[selectedMarket].tvTicker}
        symbol={ASSET_METADATA[selectedMarket].tvTicker}
        theme="dark"
        // Circle back to this later
        // overrides={{
        //   "paneProperties.backgroundType": "solid",
        //   "paneProperties.background": "#1A1A1A",
        //   "paneProperties.vertGridProperties.color": "#363c4e",
        //   "paneProperties.horzGridProperties.color": "#363c4e",
        //   "symbolWatermarkProperties.transparency": 90,
        //   "scalesProperties.textColor": "#AAA",
        //   "mainSeriesProperties.candleStyle.wickUpColor": "#336854",
        //   "mainSeriesProperties.candleStyle.wickDownColor": "#7f323f",
        // }}
      />
    </Container>
  );
}

export default Chart;
