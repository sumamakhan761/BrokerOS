---
name: mobile-ui
description: Design engineering principles for making React Native interfaces feel polished. Use when building UI components, reviewing mobile code, implementing animations, shadows, borders, micro-interactions, choosing or reviewing icons, or any visual detail work. Triggers on UI polish, mobile design, hitSlop, elevation, NativeWind, Pressable, Touchables, box-shadow, border radius.
---

# Mobile UI Polish

React Native UI is not Web UI. Mobile apps require specific tactile feedback, native shadow handling, strict touch-target sizing, and 60fps animations on the UI thread. Apply these principles when building or reviewing mobile UI.

## Quick Reference

| Category | When to use | Reference |
| --- | --- | --- |
| **Animations** | Layout transitions, spring physics, shared values | [animations.md](animations.md) |
| **Icons** | SVG usage, lucide-react-native, sizing | [icons.md](icons.md) |
| **Surfaces** | Shadows (elevation), borders, `<Pressable>` | [surfaces.md](surfaces.md) |
| **Performance** | Preventing JS thread blocks, memoization | [performance.md](performance.md) |

## Core Principles
1. **Never use HTML tags**. `<div>`, `<button>`, and `<span>` crash React Native.
2. **Never use Web CSS Shadows**. Use `elevation` (Android) and shadow props (iOS).
3. **Always use `<Pressable>`**. It is the standard for interactive elements over `TouchableOpacity`.
4. **Use NativeWind Safely**. Not all Tailwind classes map perfectly to React Native (e.g. `transition-all` doesn't work).
