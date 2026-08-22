# Mobile Icons

You are using `lucide-react-native`. Always import from there, not `lucide-react`.

## Props vs Classes
Ensure you pass `color` and `size` directly as props, not via NativeWind text classes. React Native SVGs do not inherit text colors implicitly like web SVGs do via `currentColor`.
```tsx
import { Home } from 'lucide-react-native';

// CORRECT
<Home size={24} color="#000" />

// INCORRECT (Will not apply color/size on mobile)
<Home className="w-6 h-6 text-black" />
```

## Stroke Weight
Keep stroke weight consistent. The default for Lucide is `2`. If you adjust it, apply it universally across the app.

## Wrapping Icons
Icons themselves are not interactive. If an icon is meant to be tapped, it must be wrapped in a `<Pressable>` with an appropriate `hitSlop` (see `mobile-accessibility/hit-areas.md`).
