---
name: mobile-ui
description: Design engineering principles for making React Native & Expo mobile interfaces look premium and feel tactile. Use when building UI components, reviewing mobile code, implementing spring animations, shadows, borders, micro-interactions, icons, surfaces, or visual detail work. Triggers on UI polish, mobile design, hitSlop, elevation, NativeWind, Pressable, Touchables, box-shadow, border radius, haptics, Reanimated.
---

# Mobile UI Polish & Tactile Engineering

React Native UI is not Web UI. Mobile apps require **tactile spring physics**, **native dual-platform shadows** (Android elevation + iOS shadow props), **strict minimum touch targets**, **concentric corner radii**, and **60fps/120fps animations on the UI thread**.

---

## 📚 Quick Reference & Sub-guides

| Category | When to use | Reference |
| :--- | :--- | :--- |
| **Surfaces & Shadows** | Native elevation, iOS shadow props, concentric borders, glassmorphism, skeleton loaders | [surfaces.md](surfaces.md) |
| **Animations & Springs** | Tactile press physics, Reanimated 3 shared values, layout transitions, spring parameters | [animations.md](animations.md) |
| **Icons & Touch Targets** | `lucide-react-native`, explicit props, `<Pressable>` wrapping, `hitSlop` expansion | [icons.md](icons.md) |
| **Performance & Lists** | Virtualized lists (`FlatList` / `FlashList`), `expo-image` blurhash caching, memoization | [performance.md](performance.md) |

---

## 🏛️ Core Principles

### 1. The Tactile Law: Every Tap Gives Feedback
Interactive elements on mobile must never feel "dead" or flat.
- **Visual Scale**: Scale down slightly (`scale: 0.96` to `0.98`) using Reanimated spring physics on press.
- **Haptics**: Trigger `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` on button clicks, card taps, and tab switches.
- **Always use `<Pressable>`**: Never use `TouchableOpacity` or HTML `<button>`.

### 2. Concentric Corner Radii Formula
Just like on the web, nested elements must follow the concentric formula to avoid awkward visual gaps:
$$R_{\text{outer}} = R_{\text{inner}} + \text{padding}$$

- **Cards**: `rounded-3xl` (24px) container with `p-4` (16px) $\rightarrow$ Inner child elements should be `rounded-2xl` (16px).
- **Small Chips / Badges**: `rounded-full` with `px-2.5 py-0.5`.
- **Action Buttons**: `rounded-2xl` (16px) or `rounded-xl` (12px).

### 3. Dual-Platform Shadow Handling
Web `box-shadow` CSS strings do not render properly on Android.
- **Android**: Use `elevation` in style props (e.g. `elevation: 2` for cards, `elevation: 8` for floating action buttons and modal sheets).
- **iOS**: Use `shadowColor`, `shadowOffset`, `shadowOpacity`, and `shadowRadius`.
- **Subtle Outline**: Always combine elevation with a crisp, low-opacity border (`border border-slate-200/80 dark:border-slate-800`) to define the edge cleanly on low-contrast AMOLED screens.

### 4. No HTML Tags Anywhere
React Native runs without a DOM:
- `<div>` $\rightarrow$ `<View>`
- `<span>`, `<p>`, `<h1>` $\rightarrow$ `<Text>`
- `<img>` $\rightarrow$ `<Image>` from `expo-image`
- `<button>` $\rightarrow$ `<Pressable>`
- `<a>` $\rightarrow$ `<Link>` from `expo-router`

### 5. NativeWind v4 Class Safety
- Use `className` with Tailwind utility classes.
- Avoid using web-only transition classes (e.g., `transition-all duration-300` or `hover:`) on mobile `<View>` components — they do not trigger natively. Use React Native Reanimated for motion.
