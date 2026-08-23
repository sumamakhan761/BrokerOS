# Safe Areas and Scrolling

## SafeAreaView
Mobile screens have hardware notches, dynamic islands, and home indicators.
Always wrap the root container of your screen in a `<SafeAreaView>` from `react-native-safe-area-context` so content doesn't get clipped by the OS.
*Note: If you are using Expo Router `<Stack>`, the header often handles the top safe area automatically. Only apply `edges={['bottom']}` if the top is already safe.*

## ScrollView vs `<View>`
Unlike the web, content does not scroll automatically if it overflows the viewport height. You must explicitly wrap overflowing content in a `<ScrollView>`.

## ScrollView vs FlatList (Performance Death)
If you are rendering a dynamic array of data (like a list of 100 Leads, Bookings, or Messages), **never use `array.map()` inside a `<ScrollView>`**.
It will render all 100 items into memory simultaneously, crashing older Android phones.

You MUST use a `<FlatList>` or `<FlashList>`:
```tsx
<FlatList
  data={leads}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <LeadCard lead={item} />}
/>
```
This recycles views off-screen, maintaining 60fps scrolling.
