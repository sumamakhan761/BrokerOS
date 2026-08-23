# Wrapping and Truncation

## Truncate Without Losing Content
In React Native, do not use CSS `text-overflow: ellipsis` or Tailwind's `truncate` utility. It does not work reliably on mobile text nodes.

You must use the `numberOfLines` prop natively supplied by the `<Text>` component:
```tsx
<Text numberOfLines={1} className="text-base text-black">
  This is a very long string that will truncate automatically with an ellipsis natively.
</Text>
```

## Ellipsize Mode
By default, `numberOfLines` truncates at the end (`tail`). You can control this with `ellipsizeMode`:
```tsx
// Truncates in the middle: "start...end"
<Text numberOfLines={1} ellipsizeMode="middle">
  LongFileNameThatShouldShowExtension.pdf
</Text>
```
Modes available: `head`, `middle`, `tail`, `clip`.

## Text Alignment
React Native handles `textAlign` similarly to the web (`text-left`, `text-center`, `text-right`).
**CRITICAL**: Avoid `text-justify`. It renders terribly across different Android OS versions and often causes bizarre letter spacing gaps. Stick to left, center, or right alignment.
