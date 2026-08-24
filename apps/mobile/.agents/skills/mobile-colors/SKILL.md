---
name: mobile-colors
description: NativeWind v4 color system, semantic palettes, dark mode elevation, and contrast engineering for React Native. Triggers on colors, palette, theme, dark mode, contrast, oklch, brand colors, lead status colors, NativeWind colors.
---

# Mobile Color System & Semantic Palettes

React Native and NativeWind compile colors directly into native bridge structures. This skill defines **brand blue palettes**, **lead status chips**, **dark mode elevation surfaces**, and **high-contrast sunlight readability**.

---

## 📚 Quick Reference & Sub-guides

| Category | When to use | Reference |
| :--- | :--- | :--- |
| **Color Usage & Semantics** | Lead status temperatures, deal states, dark mode elevation | [color-usage.md](color-usage.md) |
| **Palette & Token Dictionary** | Full hex mappings, NativeWind class reference | [palette-and-tokens.md](palette-and-tokens.md) |

---

## 🏛️ Core Principles

### 1. No Raw `oklch()` in Inline Styles
Native Android engines do not parse CSS functional color notations like `style={{ backgroundColor: 'oklch(...)' }}`.
- Always use **NativeWind utility classes** (`bg-blue-600`, `text-slate-900`) or standard HEX/RGBA constants.

### 2. High-Contrast Sunlight Visibility
Sales executives and Sourcing managers use this app on field visits in direct sunlight:
- Never use washed-out grey text (`text-slate-300` on white).
- Use `text-slate-900` for primary text and minimum `text-slate-600` for subtitles.
- State badges must include a defining border (`border border-emerald-200/80` or `border border-rose-200/80`).

### 3. Untinted Image Borders
Never use a warm or tinted grey for image borders on mobile. Use pure black or white with opacity: `border-black/10` or `dark:border-white/10`.
