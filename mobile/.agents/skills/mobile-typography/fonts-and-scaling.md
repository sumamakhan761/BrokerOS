# Fonts and Scaling

## System Font Scaling (Dynamic Type)
By default, React Native scales all `<Text>` based on the user's OS accessibility settings (iOS Dynamic Type or Android Display Size). 

**Rule:** Do NOT disable `allowFontScaling={false}` globally.
Only disable it for fixed UI elements (like a circular icon button or a strict tab bar) where text wrapping would break the layout entirely.

```tsx
// Only do this if absolutely necessary for layout integrity
<Text allowFontScaling={false}>Fixed Tab Name</Text>
```

## Custom Fonts
We rely on `expo-font` to load custom fonts. Ensure that when applying font families via NativeWind (e.g. `font-sans`), the font is properly loaded in the `_layout.tsx` file using `useFonts`.

## Font Weights
React Native handles `fontWeight` via mapping to the OS font. Below `18px`, stay at weight `400`+. Weights under `300` are display-only (`28px`+) and disappear at text sizes on mobile screens due to sub-pixel rendering limitations on Android.
