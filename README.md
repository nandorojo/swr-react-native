# SWR + React Native 🐮

Add React Native + React Navigation compatibility to [`swr`](https://swr.vercel.app). 👨🏻‍🔧

```diff
- import useSWR from 'swr'
+ import useSWRNative from '@nandorojo/swr-react-native'
```

**That's it.**

SWR revalidation now works in your React Native app. Requests also revalidate when your React Navigation screens focus.

## Why?

`swr` is an awesome data fetching + caching library by Vercel.

However, some of its essential features, such as `revalidateOnFocus` &amp; `revalidateOnConnect`, don't work on React Native.

This library provides a simple drop-in replacement for `useSWR`, which adds compatibility for **React Native** / **React Navigation**.

It comes with 2 hooks: `useSWRNative`, and `useSWRNativeRevalidate`.

## Features

- Adds support for `revalidateOnConnect` &amp; `revalidateOnFocus`.
- Configurable `focusEventThrottle`
- Web, iOS and Android support
- Zero config
- Revalidates when `AppState` becomes `active`
- Works with **React Navigation**, revalidating on screen `focus`

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

## Usage

There are 2 ways to use this library:

### 1. Simplest usage

Replace imports of `useSWR` with `useSWRNative`. That's it!

```ts
import useSWRNative from '@nandorojo/swr-react-native'

const { data, mutate, error } = useSWRNative(key, fetcher, config)
```

### 2. Custom usage

If, for some reason, you don't want to replace your imports, you can use the `useSWRNativeRevalidate` hook.

This option exists in case `useSWR` makes some big changes to their API or something down the line.

```ts
import { useSWRNativeRevalidate } from '@nandorojo/swr-react-native'
```

Call `useSWRNativeRevalidate`, likely below your `useSWR` function:

```ts
const { data, revalidate } = useSWR(key, fetcher)

useSWRNative({
  // required: pass your revalidate function returned by SWR
  revalidate

  // optional, defaults copied from SWR
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  focusThrottleInterval: 5000,
})
```

The `revalidate` function is required!

# Context

The idea for this library originated from [this issue](https://github.com/vercel/swr/issues/417).

I'm a big fan of SWR. I've also built a fetching library for Firebase/Firestore based on swr, which you can find [here](https://github.com/nandorojo/swr-firestore).

It's still pretty new, and isn't super battle tested, so I'd appreciate help testing it.
