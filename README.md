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
- TypeScript support
- `useSWRInfinite` support

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

### Usage with SWR v1

Currently, SWR v1 is in `beta`:

```sh
yarn add swr@beta
```

To use `swr-react-native`, you can install with `@beta` too:

```sh
yarn add swr-react-native@beta
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

If, for some reason, you don't want to replace your imports, you can use the `useSWRNativeRevalidate` hook. This allows you to de-couple the revalidation from the `useSWR` hook itself.

This option exists in case `useSWR` makes some big changes to their API or something down the line. Or, maybe you're using React Native web, and not all screens are nested in a React Navigation stack, so you want to call this only in those places.

If you're using `useSWRInfinite`, then this is the method for you.

```ts
import { useSWRNativeRevalidate } from '@nandorojo/swr-react-native'
```

Call `useSWRNativeRevalidate`, likely below your `useSWR` function:

```ts
const { data, revalidate } = useSWR(key, fetcher)

useSWRNativeRevalidate({
  // required: pass your revalidate function returned by SWR
  revalidate

  // optional, defaults copied from SWR
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  focusThrottleInterval: 5000,
})
```

The `revalidate` function is required!

If you're using `useSWRInfinite`, this you should rely on this usage:

```ts
const { data, revalidate } = useSWRInfinite(...)

useSWRNativeRevalidate({
  // required: pass your revalidate function returned by SWR
  revalidate
})
```

# Context

I'm a big fan of SWR. I've also built a fetching library for Firebase/Firestore based on swr, which you can find [here](https://github.com/nandorojo/swr-firestore).

The idea for this library originated from [this issue](https://github.com/vercel/swr/issues/417). Thanks to [@te-online](https://github.com/te-online) for help testing it.
