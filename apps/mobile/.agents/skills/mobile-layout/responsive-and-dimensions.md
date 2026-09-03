# Responsive Design & Thumb-Zone Ergonomics

---

## 1. `useWindowDimensions` for Dynamic Layouts

React Native updates layouts automatically when screens rotate or fold:

```tsx
import { useWindowDimensions, View } from 'react-native';

export function ResponsiveKpiGrid({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View className={`flex-row flex-wrap gap-3 ${isTablet ? 'gap-4' : 'gap-3'}`}>
      {children}
    </View>
  );
}
```

---

## 2. The Thumb-Zone Ergonomic Rule

Most users navigate mobile CRM screens single-handedly using their right or left thumb.
- **Top 25% of Screen (Hard Reach)**: Status summaries, project badges, avatar photos, read-only KPI figures.
- **Middle 50% of Screen (Natural Reach)**: Scrollable lead cards, customer timeline notes, unit inventory list.
- **Bottom 25% of Screen (Easy Reach)**: Primary CTA buttons (Call Lead, Add Follow-up, Log Payment), Bottom sheets, Tab navigation.

```tsx
// Floating Easy-Reach Bottom Action Bar
<View 
  style={{ paddingBottom: insets.bottom + 12 }} 
  className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-slate-200/80 dark:border-slate-800 flex-row gap-3"
>
  <Pressable className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center">
    <Text className="font-bold text-slate-800 dark:text-slate-200">Log Remark</Text>
  </Pressable>
  <Pressable className="flex-1 h-12 rounded-2xl bg-purple-600 items-center justify-center shadow-sm">
    <Text className="font-bold text-white">Call Buyer</Text>
  </Pressable>
</View>
```
