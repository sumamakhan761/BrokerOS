# Text Wrapping, Truncation & Multiline Handlers

---

## 1. Truncation via `numberOfLines`

Web CSS properties like `text-overflow: ellipsis`, `overflow: hidden`, or Tailwind `truncate` do not behave reliably in React Native. Use the native `numberOfLines` prop:

```tsx
<Text 
  numberOfLines={1} 
  ellipsizeMode="tail" 
  className="text-sm font-bold text-slate-900 dark:text-white"
>
  {lead.fullName} • {lead.projectInterest}
</Text>
```

---

## 2. Dynamic Expandable Description Hook

For customer notes, negotiation comments, or project descriptions:

```tsx
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

export function ExpandableText({ text, maxLines = 2 }: { text: string; maxLines?: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="space-y-1">
      <Text
        numberOfLines={expanded ? undefined : maxLines}
        ellipsizeMode="tail"
        className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
      >
        {text}
      </Text>
      {text.length > 80 && (
        <Pressable onPress={() => setExpanded(!expanded)} hitSlop={8}>
          <Text className="text-xs font-bold text-purple-600 dark:text-purple-400">
            {expanded ? 'Show less' : 'Read more'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
```
