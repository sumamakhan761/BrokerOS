# Safe Areas, Keyboard Insets & Scrolling

---

## 1. Safe Area Insets with `react-native-safe-area-context`

Avoid hardcoding pixel values (like `pt-12` or `pb-8`) for device status bars or home navigation bars. Different devices (iPhone dynamic island vs punch-hole Android) have varying cutouts:

```tsx
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ScreenShell({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{ paddingTop: insets.top }} 
      className="flex-1 bg-slate-50 dark:bg-slate-950"
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 80, // Extra clearance for floating bottom bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}
```

---

## 2. Keyboard Avoidance for Forms & Bottom Sheets

When building login forms, negotiation inputs, or lead remark sheets:

```tsx
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';

export function FormContainer({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
```

---

## 3. Sticky Headers in Feed Lists

To keep a search bar or tab filter pinned while scrolling:

```tsx
<ScrollView 
  stickyHeaderIndices={[1]} // Pin the 2nd child (index 1) to the top on scroll
  showsVerticalScrollIndicator={false}
>
  <DashboardGreeting />
  <View className="bg-slate-50 dark:bg-slate-950 py-2">
    <SearchAndFilterBar />
  </View>
  <LeadFeedItems />
</ScrollView>
```
