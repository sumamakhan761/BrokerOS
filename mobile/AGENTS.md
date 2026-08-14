# AGENTS.md — mobile/

Read root `AGENTS.md` first. This file adds mobile-only rules. Root owns business invariants; this file owns Expo 54 / Expo Router 6 mechanics for this project.

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code. APIs, hooks, and config keys change between SDK versions. Expo Router 6 is similarly different from earlier versions.

---

## Directory Structure

```
mobile/
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

## Scripts

Run from `mobile/`:

```bash
npx expo start           # Expo dev server (Metro bundler)
npx expo run:android     # build + run on Android device/emulator
npm run lint             # ESLint (expo lint)
```
