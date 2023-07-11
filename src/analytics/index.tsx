import mixpanel, { Mixpanel } from 'mixpanel-browser'
import { useRouter } from 'next/router'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { LocalDev } from '@/constants/auth'

import { EventMap, TrackingEvents } from './constants'

const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_ID || ''

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
