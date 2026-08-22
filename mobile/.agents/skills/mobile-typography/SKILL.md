---
name: mobile-typography
description: React Native typography from spacing to wrapping and accessibility. Use when configuring text in NativeWind, setting up a type scale, checking heading hierarchy, styling Text components, truncating text, or reviewing mobile code for typography. Triggers on Text, typography, fonts, variable fonts, font-weight, letter-spacing, line-height, type scale, heading hierarchy, text-wrap, truncation, numberOfLines, font scaling, allowFontScaling.
---

# Great Mobile Typography

Good mobile typography is mostly restraint. A sensible scale, comfortable spacing, and strict adherence to React Native's `<Text>` component behaviors beat any clever effect. Apply these principles when building or reviewing any mobile screen.

## Quick Reference

| Category | When to use | Reference |
| --- | --- | --- |
| **Spacing & Sizing** | NativeWind type scale, line heights, iOS inputs | [spacing-and-sizing.md](spacing-and-sizing.md) |
| **Wrapping & Truncation** | `numberOfLines`, ellipsizeMode, text alignment | [wrapping-and-truncation.md](wrapping-and-truncation.md) |
| **Fonts & Scaling** | Dynamic Type, `allowFontScaling`, custom fonts | [fonts-and-scaling.md](fonts-and-scaling.md) |

## Core Principles
1. **The `<Text>` Component is Law**. You cannot render raw strings inside a `<View>`. 
2. **Never use HTML text tags**. `<h1>`, `p`, and `span` will crash the mobile app.
3. **No CSS Truncation**. Do not use `text-overflow` or Tailwind `truncate`. Use `numberOfLines`.
