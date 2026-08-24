# Screen Readers (TalkBack & VoiceOver)

---

## 1. Meaningful `accessibilityLabel` & `accessibilityHint`

Never let a screen reader read out raw cryptic IDs or unlabelled icons:

```tsx
import { Pressable, Text } from 'react-native';
import { Calendar } from 'lucide-react-native';

export function ScheduleVisitButton({ leadName, onSchedule }: any) {
  return (
    <Pressable
      onPress={onSchedule}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Schedule site visit for ${leadName}`}
      accessibilityHint="Opens the date and project selection calendar modal"
      className="flex-row items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-2 rounded-xl"
    >
      <Calendar size={16} color="#7e22ce" />
      <Text className="text-xs font-bold text-purple-700">Schedule Visit</Text>
    </Pressable>
  );
}
```

---

## 2. Accessible States (`accessibilityState`)

For toggle tabs, accordions, and checkable lists:

```tsx
<Pressable
  accessibilityRole="tab"
  accessibilityState={{ selected: activeTab === 'leads' }}
  className={`px-4 py-2 rounded-full ${activeTab === 'leads' ? 'bg-purple-600' : 'bg-slate-100'}`}
>
  <Text className={activeTab === 'leads' ? 'text-white font-bold' : 'text-slate-600'}>
    Leads
  </Text>
</Pressable>
```
