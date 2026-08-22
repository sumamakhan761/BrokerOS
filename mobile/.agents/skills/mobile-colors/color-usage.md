# Mobile Color Usage

## Using OKLCH in NativeWind
Your frontend uses OKLCH for perceptually uniform colors. 
In the mobile app, NativeWind v4 supports parsing OKLCH in the `tailwind.config.js` or via standard classes if set up in your globals, but be careful with inline styles.

**Rule**: Never write `oklch(0.5 0.2 250)` directly into a React Native `style={{ color: '...' }}` prop. Not all Android React Native engines parse CSS color functions safely. Always use the NativeWind class (`text-primary`, `bg-background`).

## Dark Mode
NativeWind handles dark mode via the `dark:` prefix just like the web.
```tsx
<View className="bg-white dark:bg-black">
  <Text className="text-black dark:text-white">Theme changing text</Text>
</View>
```
To force a specific color scheme on a screen or test it, you can use the `useColorScheme` hook from `nativewind`.

## Tinted Image Outlines
A strict rule inherited from the web: Never use a near-black or near-white from the project palette (e.g. slate-900) for an image border. Tinted outlines pick up the surrounding surface color and read as dirt on the image edge.
Use pure black or white with opacity: `border-black/10` or `dark:border-white/10`.
