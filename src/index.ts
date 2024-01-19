import useSWR, { SWRResponse, SWRConfiguration, Key, Middleware } from 'swr'
import { useRef, useEffect } from 'react'
import { AppState, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type NetInfo from '@react-native-community/netinfo'
import type { NetInfoState } from '@react-native-community/netinfo'

type Props<Data, Error> = {
  /**
   * Required: pass the `mutate` function returned to you by SWR.
   */
  mutate: SWRResponse<Data, Error>['mutate']
} & Pick<
  SWRConfiguration,
  'revalidateOnFocus' | 'revalidateOnReconnect' | 'focusThrottleInterval'
>

interface AppStateAddEventListenerReturn {
  remove: () => void
}

/**
 * swr-react-native
 *
 * This is the preferred way to configure swr for react-native.
 * This supports avoiding unnecessary refreshes in nested screens when refreshInterval is set.
 *
 */
export const swrNativeMiddleware: Middleware = (useSWRNext) => {
  return (key, fetcher, config) => {
    const navigation = useNavigation()

    const swr = useSWRNext(key, fetcher, {
      ...config,
      isPaused() {
        const isPaused = config.isPaused?.() ?? false

        // do not override if explicitly set to pause
        if (isPaused) {
          return true
        }

        return !config.refreshWhenHidden && !navigation.isFocused()
      },
    })

    useSWRNativeRevalidate({
      mutate: swr.mutate,
      revalidateOnFocus: config.revalidateOnFocus,
      revalidateOnReconnect: config.revalidateOnReconnect,
      focusThrottleInterval: config.focusThrottleInterval,
    })

    return swr
  }
}

/**
 * swr-react-native
 *
 * This helps you revalidate your SWR calls, based on navigation actions in `react-navigation`.
 * This hook is not recommended to be used directly but is exported anyway for compatibility.
 */
export function useSWRNativeRevalidate<Data = any, Error = any>(
  props: Props<Data, Error>
) {
  const {
    mutate,
    // copy defaults from SWR
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    focusThrottleInterval = 5000,
  } = props

  const { addListener } = useNavigation()

  const lastFocusedAt = useRef<number | null>(null)
  const fetchRef = useRef(mutate)
  useEffect(() => {
    fetchRef.current = mutate
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
      unsubscribeReconnect = Network.addEventListener((state) => {
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
    let unsubscribeAppStateChange: AppStateAddEventListenerReturn | null | void = null

    if (revalidateOnFocus) {
      unsubscribeFocus = addListener('focus', onFocus)
      unsubscribeAppStateChange = AppState.addEventListener(
        'change',
        onAppStateChange
      )
    }

    return () => {
      if (revalidateOnFocus) {
        unsubscribeFocus?.()

        if (unsubscribeAppStateChange && unsubscribeAppStateChange?.remove) {
          unsubscribeAppStateChange.remove?.()
        } else {
          AppState.removeEventListener('change', onAppStateChange)
        }
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

type Fetcher<Data> = ((...args: any) => Data | Promise<Data>) | null

export const useSWRNative = <Data = any, Error = any>(
  key: Key,
  fn: Fetcher<Data> = null,
  config?: SWRConfiguration<Data, Error>
) => {
  const swr = useSWR<Data, Error>(key, fn, config)

  useSWRNativeRevalidate({
    mutate: swr.mutate,
    revalidateOnFocus: config?.revalidateOnFocus,
    revalidateOnReconnect: config?.revalidateOnReconnect,
    focusThrottleInterval: config?.focusThrottleInterval,
  })

  return swr
}

/**
 * swr-react-native
 *
 * This hook is not recommended to be used any more but is exported anyway for compatibility.
 */
export default useSWRNative
