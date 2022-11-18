# SWR + React Native 🐮

Add React Native + React Navigation compatibility to [`swr`](https://swr.vercel.app). 👨🏻‍🔧

```typescript
import { swrNativeMiddleware } from '@nandorojo/swr-react-native'

function App() {
  return (
    <SWRConfig value={{ use: [swrNativeMiddleware] }}>
      {
        // That's it!
      }
    </SWRConfig>
  )
}
```

SWR revalidation now works in your React Native app. Requests also revalidate when your React Navigation screens focus.

## Why?

`swr` is an awesome data fetching + caching library by Vercel.

However, some of its essential features, such as `revalidateOnFocus` &amp; `revalidateOnConnect`, don't work on React Native.

This library provides a middleware `swrNativeMiddleware` for `useSWR`, which adds compatibility for **React Native** / **React Navigation**.

## Features

- Adds support for `revalidateOnConnect` &amp; `revalidateOnFocus`.
- Adds support for `refreshInterval` &amp; `refreshWhenHidden`.
- Configurable `focusEventThrottle`
- Web, iOS and Android support
- Zero config
- Revalidates when `AppState` becomes `active`
- Works with **React Navigation**, revalidating on screen `focus`
- TypeScript support
- `useSWRInfinite` &amp; and `useSWRImmutable` support

## Installation

```sh
yarn add @nandorojo/swr-react-native
```

Next, install peer dependencies:

```sh
# if you're using expo
expo install @react-native-community/netinfo

# if you aren't using expo
yarn add @react-native-community/netinfo
```

## Migration from swr-react-native v1

V2 is now implemented as a swr middleware to support `refreshInterval` option ([details](https://github.com/nandorojo/swr-react-native/issues/22)).

The migration to the new middleware API is pretty straightforward and is recommended. We still maintain backward-compatible APIs such as `useSWRNative` and `useSWRNativeRevalidate` for ease of migration, but those previous APIs do not support `refreshInterval` option and are not recommended.

### Usage with SWR v1

```sh
yarn add swr
```

To use `swr-react-native`, you can install with the following command:

```sh
yarn add @nandorojo/swr-react-native
```

## Usage

There are 2 ways to use this library:

### 1. Global Configuration (Recommended)

Add a SWRConfig Provider with the middleware at the top of the App. That's it!

```tsx
// in App.tsx
import { swrNativeMiddleware } from '@nandorojo/swr-react-native'

function App() {
  return <SWRConfig value={{ use: [swrNativeMiddleware] }}>
    {...}
  </SWRConfig>
}

// now anywhere inside App
const { data, mutate, error } = useSWR(key, fetcher, config)
```

### 2. Per-Hook Usage

If, for some reason, you don't want to set up this library globally, you can also use the `use` option in `useSWR`'s `config`

This option is useful if you're using React Native web, and not all screens are nested in a React Navigation stack, so you want to call this only in those places.

```ts
import { swrNativeMiddleware } from '@nandorojo/swr-react-native'
```

Use `swrNativeMiddleware`, in `useSWR` config:

```ts
const { data, mutate } = useSWR(key, fetcher, {
  use: [swrNativeMiddleware],
})
```

If you're using `useSWRInfinite`, you can use like this:

```ts
const { data, mutate } = useSWRInfinite(getKey, fetcher, {
  use: [swrNativeMiddleware],
})
```

# Context

I'm a big fan of SWR. I've also built a fetching library for Firebase/Firestore based on swr, which you can find [here](https://github.com/nandorojo/swr-firestore).

The idea for this library originated from [this issue](https://github.com/vercel/swr/issues/417). Thanks to [@te-online](https://github.com/te-online) for help testing it.
