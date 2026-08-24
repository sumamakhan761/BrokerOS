# Keyboard Navigation & Form Focus

---

## 1. Clean Software Keyboard Dismissal

Tapping outside an active input on mobile should dismiss the software keyboard smoothly:

```tsx
import { TouchableWithoutFeedback, Keyboard, View } from 'react-native';

export function DismissKeyboardView({ children }: { children: React.ReactNode }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1">
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}
```

---

## 2. Accessible Form Flow with `returnKeyType`

Guide users naturally from field to field:

```tsx
import { useRef } from 'react';
import { TextInput, View } from 'react-native';

export function LoginForm() {
  const passwordRef = useRef<TextInput>(null);

  return (
    <View className="space-y-4">
      <TextInput
        placeholder="Enter email"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        blurOnSubmit={false}
        className="h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-base text-slate-900"
      />
      <TextInput
        ref={passwordRef}
        placeholder="Enter password"
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
        className="h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-base text-slate-900"
      />
    </View>
  );
}
```
