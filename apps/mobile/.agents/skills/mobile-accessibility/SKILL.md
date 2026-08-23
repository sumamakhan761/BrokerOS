---
name: mobile-accessibility
description: Accessibility engineering for React Native interfaces. Use when building or reviewing UI components, custom widgets, or when the user says "make this accessible". Triggers on accessibility, a11y, accessible, accessibilityLabel, accessibilityRole, accessibilityState, screen reader, VoiceOver, TalkBack, hitSlop.
---

# Mobile Accessibility

Mobile accessibility relies on native OS tools (VoiceOver on iOS, TalkBack on Android). Web ARIA attributes (`aria-label`, `role`) **do not work** in React Native. 

## Quick Reference

| Category | When to use | Reference |
| --- | --- | --- |
| **Screen Readers** | VoiceOver/TalkBack, roles, states, labels | [screen-readers.md](screen-readers.md) |
| **Hit Areas** | Expanding touch targets without changing layout | [hit-areas.md](hit-areas.md) |
| **Focus & Keyboard** | Managing the software keyboard | [focus-and-keyboard.md](focus-and-keyboard.md) |

## Core Principles
1. **No ARIA attributes**. HTML attributes like `aria-hidden` will not compile correctly for native.
2. **Apple HIG sizing**. All interactive elements MUST be at least 44x44pt.
3. **Explicit Roles**. A button without a role is just text to a screen reader.
