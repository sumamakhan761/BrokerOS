# Hit Areas

## The 44pt Rule
Apple Human Interface Guidelines (HIG) dictate that all touch targets must be at least 44x44 points. Android recommends 48x48dp. 

A common mistake is designing a `24x24` icon, wrapping it in a `<Pressable>`, and moving on. This is nearly impossible to tap reliably on a physical device.

## Using `hitSlop`
Do not pad the icon with NativeWind `p-4` if that ruins the visual layout. Instead, expand the touchable area invisibly using `hitSlop`:

```tsx
// Expands the touchable area by 10 points in all directions
<Pressable hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={...}>
  <Icon size={24} />
</Pressable>
```

If the visual element is `24x24`, a `hitSlop` of `10` on all sides makes the touch target exactly `44x44`. This is the perfect mobile standard.
