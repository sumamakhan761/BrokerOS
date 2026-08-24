---
name: mobile-typography
description: React Native typography system covering Plus Jakarta Sans, Geist Mono, Dynamic Type defense, tabular numerals, currency formatting, Android padding fixes, and truncation. Triggers on Text, typography, fonts, variable fonts, font-weight, letter-spacing, line-height, type scale, heading hierarchy, text-wrap, truncation, numberOfLines, font scaling, allowFontScaling, maxFontSizeMultiplier, tabular-nums.
---

# Mobile Typography & Financial Figures System

Mobile typography demands strict discipline: **predictable line-heights**, **native font baseline alignment**, **tabular currency figures for Indian Rupee (`₹`)**, and **Dynamic Type layout safeguards**.

---

## 📚 Quick Reference & Sub-guides

| Category | When to use | Reference |
| :--- | :--- | :--- |
| **Fonts & Tabular Scaling** | Custom font loading, Dynamic Type defense, `fontVariant: ['tabular-nums']` | [fonts-and-scaling.md](fonts-and-scaling.md) |
| **Type Scale & Sizing** | NativeWind type scale, optical line-heights, Android `includeFontPadding: false` | [spacing-and-sizing.md](spacing-and-sizing.md) |
| **Wrapping & Truncation** | `numberOfLines`, `ellipsizeMode`, expandable text blocks | [wrapping-and-truncation.md](wrapping-and-truncation.md) |

---

## 🏛️ Core Principles

### 1. The `<Text>` Component is Absolute Law
In React Native, any bare text string outside of a `<Text>` component crashes the entire app.
- Never write text directly in a `<View>` or `<Pressable>`.
- HTML tags (`<h1>`, `<p>`, `<span>`) crash the app.

### 2. Tabular Numeral Figures for Financial Data (`₹`)
All real estate currencies, token downpayments, commissions, dates, and call timestamps must use monospace tabular alignment to prevent layout jitter:
```tsx
<Text style={{ fontVariant: ['tabular-nums'] }} className="font-extrabold text-slate-900 text-base">
  ₹1,25,00,000
</Text>
```

### 3. Android Font Baseline Clipping Fix
Android native `TextView` defaults to adding internal extra padding which clips capital letters and custom fonts like `Plus Jakarta Sans`. Always apply:
```tsx
style={{ includeFontPadding: false, textAlignVertical: 'center' }}
```

### 4. Dynamic Type Defense (`maxFontSizeMultiplier`)
When users increase their OS text size, unconstrained text can break cards and overflow buttons. Set a reasonable ceiling:
```tsx
<Text maxFontSizeMultiplier={1.25} numberOfLines={1} ellipsizeMode="tail">
  {lead.customerName}
</Text>
```
