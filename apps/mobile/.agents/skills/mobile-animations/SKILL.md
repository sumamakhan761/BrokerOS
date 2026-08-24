---
name: mobile-animations
description: Animation engineering for React Native using Reanimated 3 and Gesture Handler. Covers spring physics, worklets, gesture-driven interactions, swipe-to-action cards, pull-to-refresh feedback, and layout transitions. Triggers on Reanimated, useSharedValue, useAnimatedStyle, withSpring, withTiming, Layout, FadeIn, LinearTransition, Gesture, GestureDetector, PanGestureHandler.
---

# Mobile Animation Engineering (Reanimated 3 & Gestures)

Web CSS keyframes and Framer Motion do not run on native mobile devices. In BrokerOS mobile, we strictly use **React Native Reanimated 3** and **React Native Gesture Handler** for 60fps/120fps UI-thread execution.

---

## 🏛️ Core Principles

### 1. Spring Physics Parameter Reference
Avoid linear/robotic easing curves. Always use spring physics with natural mass:

| Preset Name | Damping | Stiffness | Mass | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Gentle Tactile Press** | `15` | `300` | `0.8` | Buttons, cards, clickable avatars |
| **Snappy Sheet Modal** | `20` | `240` | `1.0` | Bottom action sheets, drawer slides |
| **Bouncy Metric Badge** | `12` | `350` | `0.6` | Counter jumps, unread notification dots |

```tsx
import { withSpring } from 'react-native-reanimated';

scale.value = withSpring(0.96, { damping: 15, stiffness: 300, mass: 0.8 });
```

---

## 2. Gesture-Driven Swipeable Actions (Swipe-to-Call / Delete)

For lead lists and task feeds:

```tsx
import { View, Text, Pressable } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { PhoneCall, Trash2 } from 'lucide-react-native';

export function SwipeableLeadCard({ lead, onCall, onDelete }: any) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(-120, Math.min(120, e.translationX));
    })
    .onEnd(() => {
      if (translateX.value > 80) {
        runOnJS(onCall)();
      } else if (translateX.value < -80) {
        runOnJS(onDelete)();
      }
      translateX.value = withSpring(0);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="relative bg-slate-100 rounded-3xl overflow-hidden my-1.5">
      {/* Background action triggers */}
      <View className="absolute inset-0 flex-row justify-between items-center px-6">
        <View className="flex-row items-center gap-2">
          <PhoneCall size={20} color="#059669" />
          <Text className="text-xs font-bold text-emerald-700">Call</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs font-bold text-rose-700">Delete</Text>
          <Trash2 size={20} color="#e11d48" />
        </View>
      </View>

      {/* Foreground Swipeable Card */}
      <GestureDetector gesture={pan}>
        <Animated.View style={cardStyle} className="bg-white p-4 rounded-3xl border border-slate-200/80">
          <Text className="text-sm font-bold text-slate-900">{lead.name}</Text>
          <Text className="text-xs text-slate-500">{lead.phone}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

---

## 3. Entering & Exiting Layout Animations

```tsx
import Animated, { FadeInUp, FadeOutDown, LinearTransition } from 'react-native-reanimated';

<Animated.View 
  entering={FadeInUp.springify().damping(16)}
  exiting={FadeOutDown.duration(150)}
  layout={LinearTransition.springify()}
  className="bg-white rounded-3xl p-5 border border-slate-200/80"
>
  {/* Card Content */}
</Animated.View>
```
