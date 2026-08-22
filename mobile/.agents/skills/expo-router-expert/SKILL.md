---
name: expo-router-expert
description: Navigation engineering using Expo Router. Use when creating new screens, handling deep links, passing parameters, setting up tabs or drawers, and routing users. Triggers on Expo Router, navigation, Link, router.push, Tabs, Stack, _layout.tsx, useLocalSearchParams.
---

# Expo Router Navigation

Expo Router brings file-based routing to React Native. 

## Core Principles

### 1. File-Based Routing
Screens are automatically created based on files in the `app/` directory.
- `app/index.tsx` -> `/`
- `app/profile/settings.tsx` -> `/profile/settings`
- `app/leads/[id].tsx` -> Dynamic route for `/leads/123`

### 2. The `<Link>` Component
Never use `<a href>` tags. Use the `<Link>` component from `expo-router`.
```tsx
import { Link } from 'expo-router';

<Link href="/leads/123" asChild>
  <Pressable>
    <Text>View Lead</Text>
  </Pressable>
</Link>
```
*Note: Always use `asChild` if you are wrapping a custom component like `<Pressable>` or a NativeWind styled view.*

### 3. Programmatic Navigation
Use the `useRouter` hook for navigation after an action (like a successful API call).
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/dashboard');
router.replace('/login'); // Clears the stack history
router.back();
```

### 4. Reading Parameters
Use `useLocalSearchParams` to read dynamic segments (`[id].tsx`) or query parameters.
```tsx
import { useLocalSearchParams } from 'expo-router';

const { id, filter } = useLocalSearchParams();
```

### 5. Layouts
Use `_layout.tsx` files to define `<Stack>`, `<Tabs>`, or `<Drawer>` navigators for a directory.

## Common Mistakes
- **React Navigation Hooks**: Using `@react-navigation/native` hooks (`useNavigation`) instead of Expo Router's hooks.
- **Missing `asChild`**: Nesting a `<Pressable>` inside a `<Link>` without `asChild`, causing touch issues and styling breaks.
- **Standard `<a>` tags**: Will crash the app.
