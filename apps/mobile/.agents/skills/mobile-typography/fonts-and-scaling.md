# Mobile Fonts, Dynamic Type & Tabular Figures

---

## 1. Custom Font Loading in Expo 54

BrokerOS uses **Plus Jakarta Sans** for UI headers/body and **Geist Mono** for financial figures and metrics.

### App Setup (`app/_layout.tsx`)
```tsx
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <RootNavigation />;
}
```

---

## 2. Indian Rupee (`₹`) & Tabular Figures

Real estate pricing and financial metrics must not jitter or shift horizontally during counter increments or table rendering.

```tsx
import { Text, TextProps } from 'react-native';

export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function PriceText({ amount, className = '', ...props }: { amount: number; className?: string } & TextProps) {
  return (
    <Text
      {...props}
      style={[{ fontVariant: ['tabular-nums'], includeFontPadding: false }, props.style]}
      className={`font-black text-slate-900 dark:text-white ${className}`}
    >
      {formatINR(amount)}
    </Text>
  );
}
```

---

## 3. Dynamic Type Scaling Guard

Accessibility font scaling on iOS and Android can inflate text up to 300%. To prevent action buttons from clipping:

```tsx
<Text 
  maxFontSizeMultiplier={1.25} 
  className="text-xs font-bold text-slate-700 dark:text-slate-300"
>
  Scheduled: Tomorrow, 11:30 AM
</Text>
```
