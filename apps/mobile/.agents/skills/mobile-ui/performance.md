# Mobile UI Performance & Virtualized Feeds

Smooth 60fps/120fps scrolling on low-end Android devices requires careful memory and render management.

---

## 1. List Virtualization: `FlatList` Best Practices

1. **`keyExtractor`**: Always provide a stable, unique key string (never use index).
2. **`getItemLayout`**: If item heights are fixed, supply `getItemLayout` to skip dynamic measurement passes.
3. **`windowSize` & `maxToRenderPerBatch`**:
```tsx
import { FlatList, View } from 'react-native';
import React, { useCallback } from 'react';

export function OptimizedLeadFeed({ leads, onSelectLead }: any) {
  const renderItem = useCallback(({ item }: any) => {
    return <LeadCard lead={item} onSelect={() => onSelectLead(item.id)} />;
  }, [onSelectLead]);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  return (
    <FlatList
      data={leads}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View className="h-3" />}
    />
  );
}
```

---

## 2. Image Caching & Blurhash with `expo-image`

Never use the standard React Native `<Image>` component for remote API photos or broker avatars. Use `expo-image`:

```tsx
import { Image } from 'expo-image';

export function ProjectThumbnail({ uri, blurhash }: { uri: string; blurhash?: string }) {
  return (
    <Image
      source={{ uri }}
      placeholder={blurhash || "L6PZfSi_.AyE_3t7t7R**0o#DgR4"}
      contentFit="cover"
      transition={250}
      cachePolicy="memory-disk"
      className="w-full h-44 rounded-2xl"
    />
  );
}
```

---

## 3. Pure Component Memoization

Wrap list item components in `React.memo` with custom comparison if needed:

```tsx
import React, { memo } from 'react';

export const LeadCard = memo(function LeadCard({ lead, onSelect }: any) {
  return (
    // ...
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.lead.id === nextProps.lead.id &&
    prevProps.lead.status === nextProps.lead.status &&
    prevProps.lead.updatedAt === nextProps.lead.updatedAt
  );
});
```
