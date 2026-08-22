# Focus and Keyboard Management

## Keyboard Avoidance
When a user focuses on a `<TextInput>`, the software keyboard slides up. On mobile, this will physically cover inputs on the bottom half of the screen unless managed.

Always wrap forms in a `KeyboardAvoidingView`:
```tsx
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  <ScrollView>
    {/* Form Inputs Here */}
  </ScrollView>
</KeyboardAvoidingView>
```

## Dismissing the Keyboard
Unlike the web, tapping on a non-input area on a mobile screen does not always dismiss the keyboard automatically.
Wrap your main form container in a `TouchableWithoutFeedback` to manually dismiss the keyboard:

```tsx
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  <View style={{ flex: 1 }}>
    {/* Content */}
  </View>
</TouchableWithoutFeedback>
```

## Auto-Focus
Be extremely careful with `autoFocus={true}` on inputs. On mobile, automatically throwing the keyboard in the user's face immediately upon screen load can be a jarring user experience unless they explicitly navigated to a "Search" screen.
