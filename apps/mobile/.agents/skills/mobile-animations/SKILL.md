---
name: mobile-animations
description: Animation engineering for React Native using Reanimated. Use when building transitions, micro-interactions, spring physics, layout animations, or shared element transitions. Triggers on Reanimated, useSharedValue, useAnimatedStyle, withSpring, withTiming, Layout, FadeIn.
---

# Mobile Animations

Web CSS transitions and Framer Motion do not work in React Native. We strictly use **React Native Reanimated 3** for fluid, 60fps/120fps animations on the UI thread.

## Core Principles

### 1. Reanimated over Animated
Never use the built-in `Animated` API from `react-native`. Always import from `react-native-reanimated`.

### 2. Layout Animations
For simple enter/exit animations or list item insertions, use Reanimated's layout animations instead of building complex shared values.
```tsx
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

<Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
  <Text>I will animate in, out, and smoothly shift when siblings are deleted.</Text>
</Animated.View>
```

### 3. Shared Values
Use `useSharedValue` instead of React `useState` for animation variables to prevent JS thread blocking.
```tsx
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ scale: withSpring(scale.value) }],
  };
});
```

### 4. Press Interactions
To create a "press down" effect, update a shared value in `onPressIn` and `onPressOut` of a `<Pressable>`, and apply the animated style to an `<Animated.View>` inside it.

## Common Mistakes
- **Framer Motion**: Trying to import `framer-motion` (it's web only).
- **CSS Transitions**: Using NativeWind transition classes like `transition-all duration-300` on React Native `<View>` components (this doesn't work natively like the web). Use Reanimated instead.
