import { datadogLogs } from '@datadog/browser-logs'
import mixpanel, { Mixpanel } from 'mixpanel-browser'
import { useRouter } from 'next/router'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { LocalDev } from '@/constants/auth'

import { EventMap, TrackingEvents } from './constants'

const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_ID || ''
const datadogToken = process.env.NEXT_PUBLIC_DATADOG_TOKEN || ''

type MixpanelContext = {
  mixpanel: Mixpanel | null
  isInitialized: boolean
  track: <K extends keyof EventMap>(eventName: K, properties: EventMap[K]) => void
}

const MixpanelContext = createContext<MixpanelContext>({ mixpanel: null, isInitialized: false, track: () => {} })

export const MixpanelProvider = ({ children }: { children: React.ReactNode }) => {
  const [mixpanelInstance, setMixpanelInstance] = useState<Mixpanel | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { events } = useRouter()

  useEffect(() => {
    if (!mixpanelToken || LocalDev) {
      setIsInitialized(false)
      return
    }
    const _mixpanelInstance = mixpanel.init(
      mixpanelToken,
      {
        debug: LocalDev,
        track_pageview: false,
        persistence: 'localStorage',
      },
      'perennial',
    )
    setMixpanelInstance(_mixpanelInstance)
    setIsInitialized(true)
  }, [])

  const track = useCallback(
    <K extends keyof EventMap>(eventName: K, properties: EventMap[K]) => {
      if (mixpanelInstance) {
        try {
          mixpanelInstance.track(eventName, properties)
        } catch (e) {
          console.error(e)
        }
      }
    },
    [mixpanelInstance],
  )

  useEffect(() => {
    if (!mixpanelToken || LocalDev) {
      return
    }
    const handleRouteChange = (url: string) => {
      track(TrackingEvents.pageview, { url })
    }
    events.on('routeChangeComplete', handleRouteChange)
    return () => {
      events.off('routeChangeComplete', handleRouteChange)
    }
  }, [events, track])

  return (
    <MixpanelContext.Provider value={{ mixpanel: mixpanelInstance, isInitialized, track }}>
      {children}
    </MixpanelContext.Provider>
  )
}

export { TrackingEvents }

export const useMixpanel = () => {
  const context = useContext(MixpanelContext)
  if (context === undefined) {
    throw new Error('useMixpanel must be used within a MixpanelProvider')
  }
  return context
}

const DatadogContext = createContext<{ logger: typeof datadogLogs.logger | null; isInitialized: boolean }>({
  logger: null,
  isInitialized: false,
})
export const DatadogProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!datadogToken || LocalDev) {
      setIsInitialized(false)
      return
    }

    if (!isInitialized) {
      datadogLogs.init({
        clientToken: datadogToken,
        site: 'us5.datadoghq.com',
        forwardErrorsToLogs: true,
        service: 'app.perennial.finance',
        silentMultipleInit: true,
      })
      setIsInitialized(true)
    }
  }, [isInitialized])

  return (
    <DatadogContext.Provider value={{ logger: datadogLogs.logger, isInitialized }}>{children}</DatadogContext.Provider>
  )
}

export const useDatadog = () => {
  const context = useContext(DatadogContext)
  if (context === undefined) {
    throw new Error('useDatadog must be used within a DatadogProvider')
  }
  return context
}
