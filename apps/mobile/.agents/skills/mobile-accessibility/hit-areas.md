# Touch Targets & `hitSlop` Expansion

---

## 1. Expanding Touch Targets without Breaking Layouts

When designing compact action bars (like a row of action icons in a lead card: Call, WhatsApp, Email, Notes):

```tsx
import { Pressable } from 'react-native';
import { PhoneCall } from 'lucide-react-native';

export function CallButton({ phone, onPress }: { phone: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      // Expands the touchable box by 12 points in all directions
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={`Call customer at ${phone}`}
      className="w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-200/80 active:scale-95"
    >
      <PhoneCall size={16} color="#059669" />
    </Pressable>
  );
}
```

---

## 2. Table of Hit Area Offsets

| Visual Element Size | Required `hitSlop` per side | Total Effective Target Area |
| :--- | :--- | :--- |
| `16x16px` icon | `hitSlop={14}` | `44x44pt` ✅ |
| `24x24px` button | `hitSlop={10}` | `44x44pt` ✅ |
| `32x32px` action chip | `hitSlop={6}` | `44x44pt` ✅ |
| `48x48px` primary CTA | *None needed* | `48x48pt` ✅ |
