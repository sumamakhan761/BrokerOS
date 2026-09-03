# Surfaces, Shadows & Depth in React Native

Mobile apps communicate hierarchy through surface elevation, subtle borders, and background contrast.

---

## 1. Dual-Platform Shadow Elevation

Web CSS `box-shadow` is not native. React Native requires distinct implementations for iOS and Android.

### Standard Card Shadow Utility
```tsx
import { Platform, View, ViewProps } from 'react-native';

export const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  android: {
    elevation: 2,
  },
});

export const FLOATING_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  android: {
    elevation: 8,
  },
});
```

### Usage Pattern
```tsx
<View 
  style={CARD_SHADOW} 
  className="bg-white rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800"
>
  {/* Card Content */}
</View>
```

---

## 2. The Concentric Corner Radii Rule

When nesting elements inside containers, calculate inner radii to keep borders optical and harmonious:

$$R_{\text{inner}} = R_{\text{outer}} - \text{padding}$$

| Outer Container | Outer Radius | Padding | Recommended Inner Radius |
| :--- | :--- | :--- | :--- |
| **Large Bento / Screen Card** | `rounded-3xl` (24px) | `p-4` (16px) | `rounded-2xl` (12px–16px) |
| **Standard Card** | `rounded-2xl` (16px) | `p-3` (12px) | `rounded-xl` (8px–10px) |
| **Action Sheet / Modal** | `rounded-t-3xl` (24px)| `p-6` (24px) | `rounded-2xl` (16px) |
| **Small Tag / Badge** | `rounded-full` | `px-2.5 py-0.5` | `rounded-full` |

---

## 3. Surface Dark Mode Elevation Hierarchy

In Dark Mode, elevated surfaces become slightly lighter shades of dark grey/slate (never pitch black on top of pitch black):

1. **Root Screen Canvas**: `bg-slate-950` (`#020617` / `#0b0f19`)
2. **Layer 1 Surface (Cards, Tables)**: `bg-slate-900` (`#0f172a`) with `border border-slate-800/80`
3. **Layer 2 Surface (Inner inputs, nested tiles)**: `bg-slate-800/60` with `border border-slate-700/50`
4. **Layer 3 Surface (Modals, Dropdowns, Action Sheets)**: `bg-slate-800` with `border border-slate-700`

---

## 4. Image Outlines & Crisp Edges

Never leave an image without a defining border when it might sit on an identically colored background (e.g. white avatar on white card):
```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri: user.avatarUrl }}
  className="w-12 h-12 rounded-2xl border border-slate-200/80 dark:border-slate-800"
  contentFit="cover"
  transition={200}
/>
```

---

## 5. Shimmer / Skeleton Loading State

Avoid raw spinning loaders for entire screens. Use structured skeleton cards that match the layout:
```tsx
import { View } from 'react-native';

export function CardSkeleton() {
  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-pulse">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <View className="flex-1 space-y-1.5">
          <View className="h-3.5 w-32 rounded-md bg-slate-200 dark:bg-slate-800" />
          <View className="h-2.5 w-20 rounded-md bg-slate-100 dark:bg-slate-800" />
        </View>
      </View>
      <View className="h-10 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50" />
    </View>
  );
}
```
