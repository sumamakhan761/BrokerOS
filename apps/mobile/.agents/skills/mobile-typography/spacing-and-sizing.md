# Type Scale & Spacing System in NativeWind

---

## 1. Native Mobile Type Scale

| Size Token | Font Size | Line Height | Usage |
| :--- | :--- | :--- | :--- |
| `text-[9px]` | 9px | 12px | Micro tags, notification dot badges |
| `text-[10px]` | 10px | 14px | Uppercase section overlines, chip labels |
| `text-xs` | 12px | 16px | Meta captions, timestamps, secondary notes |
| `text-sm` | 14px | 20px | Primary card title, form input text, list body |
| `text-base` | 16px | 24px | Primary action buttons, lead headline |
| `text-lg` | 18px | 26px | Screen section headers, subheadings |
| `text-xl` | 20px | 28px | Modal titles, key metric numbers |
| `text-2xl` | 24px | 32px | Primary dashboard KPI counters |
| `text-3xl` | 30px | 36px | Main dashboard welcome hero greeting |

---

## 2. Text Input Font Size Rule

On iOS, if an input has a font size smaller than `16px`, Safari and iOS WebViews will trigger an aggressive automatic screen zoom that disorients the user.

```tsx
// ✅ SAFE: 16px font size on mobile inputs
<TextInput
  className="h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base text-slate-900 dark:text-white"
  placeholderTextColor="#94a3b8"
/>
```

---

## 3. Optical Alignment & Android Padding Fix

Always disable default Android font padding when aligning text beside icons:

```tsx
<View className="flex-row items-center gap-2">
  <Calendar size={16} color="#64748b" />
  <Text style={{ includeFontPadding: false }} className="text-xs font-semibold text-slate-600">
    Site Visit Scheduled
  </Text>
</View>
```
