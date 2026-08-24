# Mobile Animations & Spring Physics (Reanimated 3)

React Native does not use CSS transitions or Framer Motion. We strictly use **React Native Reanimated 3** and **Expo Haptics** for fluid, 60fps/120fps animations on the UI thread.

---

## 1. Reusable Spring Press Hook

Every clickable card and primary button should exhibit micro-compression on press:

```tsx
import { Pressable, PressableProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 0.8,
};

export function PressableScale({
  children,
  onPress,
  scaleTo = 0.96,
  enableHaptics = true,
  className,
  style,
  ...props
}: PressableProps & { scaleTo?: number; enableHaptics?: boolean; className?: string }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      {...props}
      onPressIn={(e) => {
        if (enableHaptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        scale.value = withSpring(scaleTo, SPRING_CONFIG);
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, SPRING_CONFIG);
        props.onPressOut?.(e);
      }}
      onPress={onPress}
      className={className}
      style={style}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

---

## 2. Staggered List Entrance Animations

When loading a list of leads, tasks, or metrics, stagger their appearance from the bottom:

```tsx
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

export function StaggeredLeadList({ leads }: { leads: any[] }) {
  return (
    <Animated.View layout={LinearTransition.springify()}>
      {leads.map((lead, index) => (
        <Animated.View
          key={lead.id}
          entering={FadeInDown.delay(index * 40).springify().damping(18)}
          exiting={FadeOut.duration(150)}
          layout={LinearTransition.springify()}
        >
          <LeadCard lead={lead} />
        </Animated.View>
      ))}
    </Animated.View>
  );
}
```

---

## 3. Layout Transitions

When items expand, collapse, or reorder, use `layout={LinearTransition.springify()}` on parent views to eliminate abrupt jumps:

```tsx
<Animated.View 
  layout={LinearTransition.springify().damping(16)}
  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80"
>
  {isExpanded && <DetailedBreakdown />}
</Animated.View>
```

---

## 4. Common Animation Pitfalls

1. **`useState` for Animation**: Never run continuous animations with React state `useState`. It forces re-renders on the JS thread and drops frames. Use `useSharedValue` and `useAnimatedStyle`.
2. **Web Tailwind Classes**: `transition-all`, `duration-300`, and `hover:scale-105` do not work on React Native `<View>` elements.
3. **Missing Worklet Execution**: Always ensure functions inside `useAnimatedStyle` run on the UI thread (Reanimated handles this automatically when imported properly).
