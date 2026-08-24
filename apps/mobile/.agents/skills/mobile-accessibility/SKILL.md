---
name: mobile-accessibility
description: Mobile accessibility engineering for React Native. Covers TalkBack (Android), VoiceOver (iOS), 44x44pt hitSlop touch target formulas, accessibilityLabel, accessibilityRole, and live accessibility announcements. Triggers on accessibility, a11y, accessible, accessibilityLabel, accessibilityRole, accessibilityState, screen reader, VoiceOver, TalkBack, hitSlop.
---

# Mobile Accessibility (a11y) & Screen Readers

Mobile accessibility is tied directly to native accessibility APIs (TalkBack on Android, VoiceOver on iOS). Web HTML ARIA attributes (`aria-label`, `aria-hidden`) **do not work** in React Native.

---

## 📚 Quick Reference & Sub-guides

| Category | When to use | Reference |
| :--- | :--- | :--- |
| **Touch Targets & Hit Areas** | 44x44pt touch minimums, `hitSlop` expansion formulas | [hit-areas.md](hit-areas.md) |
| **Screen Readers & Labels** | `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`, dynamic announcements | [screen-readers.md](screen-readers.md) |
| **Focus & Keyboard Navigation** | Software keyboard dismissal, `returnKeyType`, accessible form validation | [focus-and-keyboard.md](focus-and-keyboard.md) |

---

## 🏛️ Core Principles

### 1. The 44x44pt Touch Target Law (Apple HIG & Google Material)
Any interactive button, toggle, or icon MUST provide at least a `44x44` point tap area.
- If the visual icon is only `18x18px`, expand its hit target using `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}`.

### 2. Explicit `accessibilityRole`
A pressable element without an `accessibilityRole="button"` is announced to TalkBack simply as "Text", leaving visually impaired users unsure if it can be activated.

### 3. Native Live Announcements for Asynchronous Events
When an action completes (e.g. "Site Visit Confirmed" or "Lead Status Updated"), announce it:
```tsx
import { AccessibilityInfo } from 'react-native';

AccessibilityInfo.announceForAccessibility('Lead marked as hot');
```
