# Mobile Color Usage & Domain Semantics

---

## 1. Domain Status Badge Mappings

BrokerOS relies on strict real estate color sematics across leads, site visits, and booking commissions:

| Business State | Background (Light) | Text Color (Light) | Border Color (Light) | Dark Mode Classes |
| :--- | :--- | :--- | :--- | :--- |
| **HOT Lead / Overdue** | `bg-rose-50` | `text-rose-700` | `border-rose-200/80` | `dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800` |
| **WARM Lead / Pending** | `bg-amber-50` | `text-amber-700` | `border-amber-200/80` | `dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800` |
| **COLD Lead / Info** | `bg-blue-50` | `text-blue-700` | `border-blue-200/80` | `dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800` |
| **BOOKED / Verified** | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200/80`| `dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800` |
| **Negotiation / In-Review**| `bg-purple-50` | `text-purple-700` | `border-purple-200/80`| `dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800` |

### Reusable Status Badge Component
```tsx
import { View, Text } from 'react-native';

const STYLES: Record<string, { bg: string; text: string; border: string }> = {
  HOT: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200/80 dark:border-rose-800' },
  WARM: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200/80 dark:border-amber-800' },
  COLD: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200/80 dark:border-blue-800' },
  BOOKED: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/80 dark:border-emerald-800' },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status.toUpperCase()] || STYLES.COLD;
  return (
    <View className={`${style.bg} ${style.border} border px-2.5 py-0.5 rounded-full`}>
      <Text className={`${style.text} text-[10px] font-extrabold uppercase tracking-wider`}>
        {status}
      </Text>
    </View>
  );
}
```

---

## 2. Dark Mode Elevation

When building dark mode screens:
- **Never use pure `#000000`** as the background for cards.
- Use `bg-slate-950` (`#020617`) for the screen canvas, and `bg-slate-900` (`#0f172a`) for elevated card surfaces.
- Always include `border border-slate-800` on dark cards to prevent cards from bleeding into each other.
