# Surfaces and Depth

## Native Shadows (Elevation)
Web `box-shadow` CSS does not work reliably on Android. You must use `elevation` for Android and shadow props for iOS.
When using NativeWind, use `shadow-sm`, `shadow-md`, etc., which are mapped to native shadows, but **always verify on Android** that the shadow renders. 

For custom complex shadows, fallback to the style prop:
```tsx
<View style={{
  shadowColor: '#000', // iOS
  shadowOffset: { width: 0, height: 2 }, // iOS
  shadowOpacity: 0.1, // iOS
  shadowRadius: 4, // iOS
  elevation: 3 // Android (Critical)
}}>
```

## `<Pressable>` States
Always use `<Pressable>` for surfaces that users tap (cards, buttons, list items). It provides more control over the pressed state than the legacy `TouchableOpacity`. 
Use the `pressed` state in NativeWind via `active:opacity-70` or `active:bg-gray-100`.

## Image Outlines
Just like the web, if you have a white image on a white background, add a subtle border (`border border-black/10`). Use `expo-image` for high-performance caching instead of the default React Native `<Image>`.
