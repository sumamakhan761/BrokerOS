---
name: mobile-layout
description: Mobile layout engineering for React Native. Covers Yoga flexbox, SafeAreaView, KeyboardAvoidingView, ScrollView content padding, sticky headers, and thumb-zone ergonomics. Triggers on Flexbox, flex-col, flex-row, SafeAreaView, ScrollView, FlatList, KeyboardAvoidingView, insets, padding, margins, absolute positioning.
---

# Mobile Layout Engineering & Safe Areas

React Native uses Yoga Flexbox, where **defaults, safe-area constraints, keyboard interactions, and scrolling physics differ fundamentally from the browser DOM**.

---

## 📚 Quick Reference & Sub-guides

| Category | When to use | Reference |
| :--- | :--- | :--- |
| **Safe Areas & Keyboard** | Header/Tab bar insets, `useSafeAreaInsets`, `KeyboardAvoidingView` | [safe-areas-and-scrolling.md](safe-areas-and-scrolling.md) |
| **Flexbox Differences** | Flex column default, no CSS grid, absolute centering | [flexbox-differences.md](flexbox-differences.md) |
| **Responsive & Thumb-Zone** | `useWindowDimensions`, tablet adaptivity, bottom-heavy UX | [responsive-and-dimensions.md](responsive-and-dimensions.md) |

---

## 🏛️ Core Principles

### 1. Flex Defaults to Column (`flex-col`)
Writing `<View className="flex-1">` creates a vertical column by default. To position children horizontally, you **must explicitly write** `flex-row`.

### 2. Containers Do Not Scroll Automatically
Unlike web pages where content flows offscreen and triggers browser scrollbars, a React Native `<View>` will clip content when it exceeds the screen viewport. You must use `<ScrollView>` or `<FlatList>`.

### 3. Safe Area Inset Law
Never hardcode fixed top padding for phone notches or dynamic islands:
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
// Apply insets.top to header and insets.bottom to floating action bars
```

### 4. `contentContainerStyle` vs `style` on ScrollViews
Padding inside scrollable views must be applied to `contentContainerStyle` (or `contentContainerClassName` in NativeWind v4), NOT `style`. Applying padding to `style` clips the scrollable track.
