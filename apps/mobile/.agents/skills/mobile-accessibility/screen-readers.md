# Screen Readers in React Native

## `accessible={true}`
To make a component readable by a screen reader, mark it with `accessible={true}`. By default, `<Text>` components are accessible, but custom groups of text (like a card) should be grouped.

## Grouping Content
Instead of the screen reader reading 5 separate text nodes on a card, wrap the card in a `<View accessible={true} accessibilityLabel="Card title, subtitle, and price">` so it reads as one cohesive item. This prevents the user from having to swipe 5 times to get past a single card.

## `accessibilityRole`
Always define what an interactive element is.
```tsx
<Pressable
  accessible={true}
  accessibilityRole="button" // CRITICAL
  accessibilityLabel="Submit application"
  onPress={submit}
>
  <Text>Submit</Text>
</Pressable>
```
Common roles: `button`, `link`, `header`, `image`, `switch`. If this is missing on a `Pressable`, the user does not know they can interact with it.

## `accessibilityState`
If a button is disabled or selected, tell the screen reader:
```tsx
<Pressable
  accessibilityRole="button"
  accessibilityState={{ disabled: true, selected: isSelected }}
>
```

## `accessibilityHint`
Use this to describe what happens when the user performs an action, if it's not obvious from the label.
`accessibilityHint="Opens a new browser window"`

## Hiding from Screen Readers
If an icon is purely decorative (e.g. an arrow next to a "Next" button), hide it from the screen reader:
```tsx
<Icon importantForAccessibility="no-hide-descendants" accessibilityElementsHidden={true} />
```
