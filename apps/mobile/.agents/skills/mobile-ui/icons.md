# Mobile Icons & Interactive Touch Targets

In BrokerOS mobile, we strictly use `lucide-react-native`.

---

## 1. Explicit Props vs Tailwind Classes

React Native SVGs do not inherit text colors implicitly like web SVGs do with `currentColor`. You **MUST** pass `size`, `color`, and `strokeWidth` directly as props:

```tsx
import { Home, PhoneCall } from 'lucide-react-native';

// ✅ CORRECT: Explicit props
<Home size={20} color="#9333ea" strokeWidth={2} />

// ❌ INCORRECT: Tailwind classes fail to apply SVG dimensions & color reliably
<Home className="w-5 h-5 text-purple-600" />
```

---

## 2. Standard Sizing Scale

| Usage | Size Prop | Stroke Width | Recommended Container |
| :--- | :--- | :--- | :--- |
| **Tab Bar Icons** | `size={22}` | `strokeWidth={2}` | Auto (Tab Bar) |
| **Card Header / Avatar Badges** | `size={18}` | `strokeWidth={2}` | `w-9 h-9 rounded-xl` |
| **Compact List Actions (Call, Mail)** | `size={16}` | `strokeWidth={2}` | `w-8 h-8 rounded-lg` |
| **Metric Stat Card Icon** | `size={20}` | `strokeWidth={2.2}`| `w-10 h-10 rounded-2xl` |

---

## 3. Interactive Icon Targets & `hitSlop`

Icons themselves cannot be tapped directly. Always wrap clickable icons in `<Pressable>` with `hitSlop` to ensure comfortable 44x44pt touch areas:

```tsx
import { Pressable } from 'react-native';
import { PhoneCall } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export function CallIconButton({ phoneNumber, onPress }: { phoneNumber: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={`Call ${phoneNumber}`}
      className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center active:scale-95 transition-transform"
    >
      <PhoneCall size={18} color="#059669" strokeWidth={2} />
    </Pressable>
  );
}
```

---

## 4. Icon Badge Overlay

For notification counts or online presence dots:

```tsx
import { View } from 'react-native';
import { Bell } from 'lucide-react-native';

export function NotificationBell({ count }: { count: number }) {
  return (
    <View className="relative">
      <Bell size={22} color="#0f172a" />
      {count > 0 && (
        <View className="absolute -top-1 -right-1 bg-rose-600 rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border border-white">
          <Text className="text-[9px] font-black text-white">{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}
```
