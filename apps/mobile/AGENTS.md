# AGENTS.md — apps/mobile/

---

## Directory Structure

```
apps/mobile/
  app/
    _layout.tsx        ← Root layout (expo-router entry, font loading, auth redirect)
    admin.tsx          ← Admin-specific entry
    (auth)/            ← Route group: login/signup screens (no auth required)
      sign-in.tsx
      sign-up.tsx
    (dashboard)/
      _layout.tsx      ← THE MAIN SHELL: role detection, tab bar, socket init, push token registration, auto-dialer start
      index.tsx        ← Redirects to role-specific home
      notifications.tsx
      chat/
      admin/           ← 14 role dirs total
      business-manager/
      channel-partner/
      closing-manager/
      director/
      finance/
      post-sales/
      pre-sales/
      pre-sales-manager/
      sales/
      sales-executive/
      sales-manager/
      sourcing-manager/
  components/          ← Shared RN components
  constants/           ← App-wide constants (colors, sizes)
  hooks/
    useCallStatus.ts   ← Syncs auto-dialer call events to backend
  lib/
    auth-client.ts     ← Better Auth expo client (createAuthClient + expoClient plugin)
    SocketContext.tsx  ← Socket context + useSocket() hook
    location-tracking.ts ← GPS tracking utilities for site visit verification
  modules/
    auto-dialer/       ← Custom native Android module (local package)
  assets/              ← Images, fonts, icons
```

---

## Styling — NativeWind

- Use `className` prop with Tailwind v3 class names.
- Do not mix NativeWind and `StyleSheet` in the same component unless absolutely necessary.
- Custom colors are in `tailwind.config.js`. Check there before adding new color values.
- `global.css` is the NativeWind entry point. Do not import Tailwind from multiple places.

---

## Android Only

- This project has only Android configured (`android/` directory exists, no `ios/` directory).
- `google-services.json` is present for Firebase (used indirectly by Expo Notifications on Android).
- Build: `npx expo run:android`. OTA updates via EAS (`eas.json` present).

---

## Skills

You **MUST** consult the appropriate skill before making changes, based on the task you are doing:

- **Routing & Navigation**: If the task involves screens, navigation, deep links, `<Link>`, `useRouter`, tabs, or `_layout.tsx`, read:
  `.agents/skills/expo-router-expert/SKILL.md`
- **General UI & Components**: If you are asked to build or modify UI components, surfaces, icons, or touch interactions, read:
  `.agents/skills/mobile-ui/SKILL.md`
- **Layouts & Spacing**: When structuring screens with Flexbox, `SafeAreaView`, `FlatList`, `ScrollView`, or `KeyboardAvoidingView`, read:
  `.agents/skills/mobile-layout/SKILL.md`
- **Colors & Theming**: When applying colors, NativeWind classes, or dark mode theming, read:
  `.agents/skills/mobile-colors/SKILL.md`
- **Typography**: When working with `<Text>` components, font sizes, `numberOfLines`, or font scaling, read:
  `.agents/skills/mobile-typography/SKILL.md`
- **Animations**: When adding transitions, micro-interactions, spring physics, or Reanimated, read:
  `.agents/skills/mobile-animations/SKILL.md`
- **Accessibility (a11y)**: When ensuring components work with TalkBack, VoiceOver, or touch target sizes, read:
  `.agents/skills/mobile-accessibility/SKILL.md`
- **Testing**: When writing or updating Jest unit tests, Maestro E2E flows, or native JUnit tests, read:
  `.agents/skills/write-mobile-tests/SKILL.md`

---

## Scripts

Run from `apps/mobile/` directory (or use `pnpm --filter @brokeros/mobile <cmd>` from root):

```bash
npx expo start           # Expo dev server (Metro bundler)
npx expo run:android     # build + run on Android device/emulator
npm run lint             # ESLint (expo lint)
```
