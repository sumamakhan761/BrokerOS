---
name: expo-router-expert
description: Advanced navigation engineering using Expo Router 6 in React Native. Covers file-based routing, route groups, dynamic tab bar filtering by user role, nested stack navigators, modal presentations, typed router.push, useLocalSearchParams, and Better Auth route protection. Triggers on Expo Router, navigation, Link, router.push, Tabs, Stack, _layout.tsx, useLocalSearchParams, useSegments.
---

# Expo Router 6 Navigation Engineering

Expo Router 6 delivers file-based, deep-linkable native navigation. In BrokerOS mobile, we manage **14 distinct roles** through a single unified `(dashboard)` shell with dynamic tab filtering and nested stacks.

---

## 🏛️ Core Principles

### 1. File & Group Structure
```
apps/mobile/app/
  _layout.tsx                  ← Root Layout (Auth state gatekeeper, fonts, background tasks)
  (auth)/                      ← Public route group
    _layout.tsx
    sign-in.tsx
    sign-up.tsx
  (dashboard)/                 ← Protected enterprise workspace
    _layout.tsx                ← THE MAIN SHELL: dynamic tab filtering, socket & notifications
    notifications.tsx          ← Global notification center
    chat/                      ← Messaging & chat rooms
    sales-executive/
      index.tsx                ← Sales Executive dashboard
      lead-management/
        index.tsx              ← Lead table feed
        [id].tsx               ← Deep dynamic lead profile route
```

---

## 2. Programmatic Navigation & Parameter Handling

### Navigating to a Screen
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

// Push new screen onto stack
router.push('/(dashboard)/sales-executive/lead-management/123');

// Replace history (e.g. after login or logout)
router.replace('/(auth)/sign-in');

// Go back
router.back();
```

### Reading Route Parameters
```tsx
import { useLocalSearchParams } from 'expo-router';

export function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>Lead ID: {id}</Text>
    </View>
  );
}
```

---

## 3. The `<Link>` Component with `asChild`

When wrapping a custom styled component or `<Pressable>` with `<Link>`, you **MUST** supply `asChild`:

```tsx
import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';

<Link href="/(dashboard)/sales-executive/booking" asChild>
  <Pressable className="h-12 bg-purple-600 rounded-2xl items-center justify-center">
    <Text className="text-white font-bold">New Booking</Text>
  </Pressable>
</Link>
```

---

## 4. Modal Stacks & Presentation

To render a sub-screen as an iOS/Android native presentation sheet modal:

```tsx
// in app/(dashboard)/_layout.tsx or nested _layout.tsx
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen 
    name="modal-schedule-visit" 
    options={{ 
      presentation: 'modal',
      headerShown: true,
      title: 'Schedule Site Visit' 
    }} 
  />
</Stack>
```
