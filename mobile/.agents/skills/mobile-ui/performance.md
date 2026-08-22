# Mobile UI Performance

## Avoid JS Thread Blocking
Animations and heavy calculations must not block the JS thread. 
- Use **Reanimated** for animations (UI Thread).
- Avoid putting complex logic directly inside `onScroll` events unless using `useAnimatedScrollHandler`.

## Memoization
React Native apps suffer heavily from unnecessary re-renders.
- Use `React.memo` for pure components (like individual items in a `FlatList`).
- Use `useCallback` for functions passed down as props to list items.

## Images
Never use the default React Native `<Image>` component for network images. It does not cache effectively.
Always use `expo-image`, which caches natively and prevents flickering during re-renders.
