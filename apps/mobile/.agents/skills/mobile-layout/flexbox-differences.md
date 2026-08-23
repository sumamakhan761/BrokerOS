# Flexbox Differences (Web vs React Native)

## 1. Column by Default
On the web, `display: flex` defaults to `flex-direction: row`. In React Native, it defaults to `column`.
When you write `flex` in NativeWind, you are creating a column. If you want a row, you MUST explicitly write `flex-row`.

## 2. No CSS Grid
React Native does not support CSS Grid. If you try to use `grid-cols-2` in NativeWind, it will fail silently or crash.
To create a grid, you have two options:
1. **Flex Wrap**: `<View className="flex-row flex-wrap gap-4">`
2. **FlatList Columns**: `<FlatList numColumns={2} ... />` (Preferred for long lists).

## 3. Gap Support
You can use `gap-4` in NativeWind for flex containers natively. Rely on this instead of applying `margin-bottom` to every child in a list, which is a legacy practice.

## 4. Absolute Positioning
React Native supports `position: 'absolute'`, but it is relative to the parent container automatically (no need to specify `position: 'relative'` on the parent like on the web). Use it sparingly, as z-index rendering order on Android is strictly determined by the component tree order (the last element renders on top) plus `elevation`.
