import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import { Container } from '@/components/design-system'

const AdvancedRealTimeChart = dynamic(() => import('./TradingviewWidget'), { ssr: false })

function Chart() {
  const [canRender, setCanRender] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!!containerRef.current && !canRender) setCanRender(true)
  }, [containerRef, canRender])

  return (
    <Container height="100%" p={0}>
      <div id="tv-widget-container" style={{ height: '100%' }} ref={containerRef} />
      {canRender && <AdvancedRealTimeChart theme="dark" containerId="tv-widget-container" />}
    </Container>
  )
}

export default Chart
