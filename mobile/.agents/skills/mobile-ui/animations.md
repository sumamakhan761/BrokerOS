# Mobile Animations

Web CSS transitions and Framer Motion do not work natively in React Native. We strictly use **React Native Reanimated 3** for fluid, 60fps/120fps animations on the UI thread.

## Layout Animations
For simple enter/exit animations or list item insertions, use Reanimated's layout animations instead of building complex shared values.
```tsx
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

<Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
  <Text>I will animate smoothly when siblings are added or removed.</Text>
</Animated.View>
```

## Shared Values
Use `useSharedValue` instead of React `useState` for animation variables to prevent JS thread blocking.
```tsx
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ scale: withSpring(scale.value) }],
  };
});
```

## Press Interactions
To create a "press down" effect, update a shared value in `onPressIn` and `onPressOut` of a `<Pressable>`, and apply the animated style to an `<Animated.View>` inside it. Do not rely solely on NativeWind `active:` classes for complex motion, as Reanimated provides superior physics.
