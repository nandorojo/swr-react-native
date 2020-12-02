import useSWR, { responseInterface, ConfigInterface, keyInterface } from 'swr'
import { useRef, useEffect } from 'react'
import { AppState, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type NetInfo from '@react-native-community/netinfo'
import type { NetInfoState } from '@react-native-community/netinfo'

type Props<Data, Error> = {
  /**
   * Required: pass the `revalidate` function returned to you by SWR.
   */
  revalidate: responseInterface<Data | null, Error>['revalidate']
} & Pick<
  ConfigInterface,
  'revalidateOnFocus' | 'revalidateOnReconnect' | 'focusThrottleInterval'
>

/**
 * swr-react-native
 *
 * This helps you revalidate your SWR calls, based on navigation actions in `react-navigation`.
 */
export function useSWRNativeRevalidate<Data = any, Error = any>(
  props: Props<Data, Error>
) {
  const {
    revalidate,
    // copy defaults from SWR
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    focusThrottleInterval = 5000,
  } = props

  const { addListener } = useNavigation()

  const lastFocusedAt = useRef<number | null>(null)
  const fetchRef = useRef(revalidate)
  useEffect(() => {
    fetchRef.current = revalidate
  })
  const focusCount = useRef(
    Platform.select({
      // react-navigation fire a focus event on the initial mount, but not on web
      web: 1,
      default: 0,
    })
  )

  const previousAppState = useRef(AppState.currentState)
  const previousNetworkState = useRef<NetInfoState | null>(null)

  useEffect(() => {
    let unsubscribeReconnect: ReturnType<
      typeof NetInfo.addEventListener
    > | null = null
    if (revalidateOnReconnect && Platform.OS !== 'web') {
      // inline require to avoid breaking SSR when window doesn't exist
      const Network: typeof NetInfo = require('@react-native-community/netinfo')
        .default
      // SWR does all of this on web. 
      unsubscribeReconnect = Network.addEventListener(state => {
        if (
          previousNetworkState.current?.isInternetReachable === false &&
          state.isConnected &&
          state.isInternetReachable
        ) {
          fetchRef.current()
        }
        previousNetworkState.current = state
      })
    }

    const onFocus = () => {
      if (focusCount.current < 1) {
        focusCount.current++
        return
      }
      const isThrottled =
        focusThrottleInterval &&
        lastFocusedAt.current &&
        Date.now() - lastFocusedAt.current <= focusThrottleInterval

      if (!isThrottled) {
        lastFocusedAt.current = Date.now()
        fetchRef.current()
      }
    }

    const onAppStateChange = (nextAppState: AppState['currentState']) => {
      if (
        previousAppState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        // swr handles this on web.
        Platform.OS !== 'web'
      ) {
        onFocus()
      }

      previousAppState.current = nextAppState
    }

    let unsubscribeFocus: ReturnType<typeof addListener> | null = null

    if (revalidateOnFocus) {
      unsubscribeFocus = addListener('focus', onFocus)
      AppState.addEventListener('change', onAppStateChange)
    }

    return () => {
      if (revalidateOnFocus) {
        unsubscribeFocus?.()
        AppState.removeEventListener('change', onAppStateChange)
      }
      if (revalidateOnReconnect) {
        unsubscribeReconnect?.()
      }
    }
  }, [
    addListener,
    focusThrottleInterval,
    revalidateOnFocus,
    revalidateOnReconnect,
  ])
}

type fetcherFn<Data> = ((...args: any) => Data | Promise<Data>) | null

export default function useSWRNative<Data = any, Error = any>(
  key: keyInterface,
  fn: fetcherFn<Data>,
  config?: ConfigInterface<Data, Error>
) {
  const swr = useSWR(key, fn, config)

  useSWRNativeRevalidate({
    revalidate: swr.revalidate,
    revalidateOnFocus: config?.revalidateOnFocus,
    revalidateOnReconnect: config?.revalidateOnReconnect,
    focusThrottleInterval: config?.focusThrottleInterval,
  })

  return swr
}
