# SWR + React Native 🐮

Make SWR fit well into your React Native/React Navigation app.

```js
const { data, revalidate } = useSWR(key, fetcher);

useSWRNative({
  revalidate,
});
```

That's all.

# Why?

`swr` is an awesome data fetching + caching library by Vercel.

However, some of its essential features, such as `revalidateOnFocus` &amp; `revalidateOnConnect`, don't work on React Native.

This library provides a simple hook to add SWR compatibility for **React Native** / **React Navigation**.

# Features

- Adds support for `revalidateOnConnect` &amp; `revalidateOnFocus`.
- Configurable `focusEventThrottle`
- Web, iOS and Android compatibility.
- Zero config necessary.
- Works with **React Navigation**

# Installation

```
yarn add @nandorojo/swr-react-native

# or npm i @nandorojo/swr-react-native
```

Next, install peer dependencies:

```
# if you're using expo
expo install @react-native-community/netinfo

# if you aren't using expo
yarn add @react-native-community/netinfo
```

# Usage

```ts
import { useSWRNative } from '@nandorojo/swr-firestore';
```

Then, in your component, call `useSWRNative`, likely below your `useSWR` function:

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
