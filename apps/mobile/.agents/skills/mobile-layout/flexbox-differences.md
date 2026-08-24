# React Native Flexbox Differences from Web CSS

---

## 1. Column by Default
- **Web**: `display: flex` arranges items in a horizontal `row` unless specified.
- **React Native**: Every `<View>` is already `display: flex` and defaults to `flexDirection: 'column'`.

```tsx
// Horizontal layout in React Native
<View className="flex-row items-center justify-between">
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

---

## 2. No CSS Grid (`display: grid`)
React Native does not support CSS Grid. To create 2-column or 3-column metric grids:

```tsx
// 2-Column Responsive Grid via Flex Wrapping
<View className="flex-row flex-wrap gap-3">
  {kpis.map((kpi) => (
    <View key={kpi.id} className="w-[48%] bg-white rounded-3xl p-4 border border-slate-200/80">
      <Text className="text-xs font-bold text-slate-500">{kpi.title}</Text>
      <Text className="text-xl font-black text-slate-900 mt-1">{kpi.value}</Text>
    </View>
  ))}
</View>
```

---

## 3. Absolute Centering Utility
To center an icon or loader perfectly inside a container:

```tsx
<View className="flex-1 items-center justify-center">
  <ActivityIndicator size="large" color="#9333ea" />
</View>
```
